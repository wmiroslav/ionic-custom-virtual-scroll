import { Component, ViewChild, OnDestroy, OnInit, NgZone  } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ApiService } from '../../services/api';
import { Subscription } from 'rxjs/Subscription';
import { Platform } from 'ionic-angular';
import { Content } from 'ionic-angular';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnDestroy, OnInit{


  @ViewChild(Content) content: Content;
  private apiSubscribtion: Subscription;
  private scrollSubscribtion: Subscription;
  results = [];
  visibleResults = [];
  isLoading = false;

  //init values for virtual scroll
  heightCoefficient = 7;//just default, init value
  itemHeight = 135; //item height in px
  scrollBuffer = 7; //safe "margin" for scroll


  constructor(public navCtrl: NavController, private api: ApiService, private zone: NgZone, private platform: Platform) {
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.initVirtualScrollEvent();
      this.getData();
      this.initVirtualScroll();
    });
    
  }


  // get data from fake api
  getData(infiniteScroll?) {
    this.isLoading = true;
    this.apiSubscribtion = this.api.getData().subscribe((response) => {
      console.log(response);
      for (let i = 0, len = response.length; i < len; i++) {
        this.results.push(response[i]);
      }
      this.isLoading = false;
      if (infiniteScroll) {
        infiniteScroll.complete();
      }
      this.refreshScroll();
    }, (error) => {
      console.log(error);
      this.isLoading = false;
      if (infiniteScroll) {
        infiniteScroll.complete();
      }
    });
  }


  ngOnDestroy() {
    this.apiSubscribtion.unsubscribe();
    if(this.scrollSubscribtion) {
      this.scrollSubscribtion.unsubscribe();
    }
  }


  /////////////////////////
  ////// Virtual list logic
  /////////////////////////
  helperBeforeHeight: number = 0;
  helperAfterHeight: number = 0;

  private setVisibleItems(from, to) {
    this.visibleResults = [];
    this.helperBeforeHeight = this.itemHeight * from;
    for (let i = from; i <= to; i++) {
      this.visibleResults.push(this.results[i]);
    }
    this.helperAfterHeight = this.itemHeight * (this.results.length - to -1);
  }


  private refreshScroll() {

    let resultsLength = this.results.length;
    if (resultsLength > 0) {
      console.log('calc');
      let scrollTop = this.content.scrollTop || 1;
      //calculate elements to show/hide
      let indexOfFirstVisibleItem = Math.floor(scrollTop / this.itemHeight) - this.scrollBuffer;
      let indexOfLastVisibleItem = indexOfFirstVisibleItem + this.heightCoefficient + this.scrollBuffer;

      indexOfFirstVisibleItem = (indexOfFirstVisibleItem < 0) ? 0 : indexOfFirstVisibleItem;
      indexOfLastVisibleItem = (indexOfLastVisibleItem >= resultsLength) ? (resultsLength - 1) : indexOfLastVisibleItem;

      //show and hide elements
      this.setVisibleItems(indexOfFirstVisibleItem, indexOfLastVisibleItem);

    }
  }


  private initVirtualScroll() {
    let platformHeight;
    platformHeight = this.platform.height() || 1500;
    this.heightCoefficient = Math.ceil(platformHeight / this.itemHeight) || 10;
  }


  private initVirtualScrollEvent() {
    let startScrollTop = 0;
    this.scrollSubscribtion = this.content.ionScroll.subscribe(($event: any) => {
      let offset = Math.abs($event.scrollTop - startScrollTop);
      if (offset > this.itemHeight) {
        console.log(offset);
        startScrollTop = $event.scrollTop;
        this.zone.run(() => {
          this.refreshScroll();
        });
      }
    });
  }




}
