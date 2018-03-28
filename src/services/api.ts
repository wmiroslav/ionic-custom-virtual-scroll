import { Injectable } from '@angular/core';
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ApiService {


    constructor() {
    }
    

    // fake API
    getData() {
        let response = this.generateResponse();
        return Observable.of(response);
    }

    private generateResponse() {
        let response = [];
        for(let i = 0; i < 16; i++) {
            let number = Math.floor(Math.random() * 10000);
            let obj = {
                title: "Title " + number,
                description: "Some description " + number
            }
            response.push(obj);
        }
        return response;
    }






}
