import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface BluetoothData {
  bpm: string;
  spo2: string;
}

@Injectable({
  providedIn: 'root'
})
export class BluetoothDataService {
  private dataSubject = new BehaviorSubject<BluetoothData[]>([]);
  public data$ = this.dataSubject.asObservable();

  private latestDataSubject = new BehaviorSubject<BluetoothData | null>(null);
  public latestData$ = this.latestDataSubject.asObservable();

  updateData(newData: BluetoothData) {
    const currentData = this.dataSubject.value;
    this.dataSubject.next([...currentData, newData]);
    this.latestDataSubject.next(newData);
    console.log('Dados Bluetooth atualizados:', newData);
  }

  clearData() {
    this.dataSubject.next([]);
    this.latestDataSubject.next(null);
  }
}
