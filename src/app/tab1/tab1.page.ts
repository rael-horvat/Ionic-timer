import { Component } from '@angular/core';
import { TimestampService } from '../service/timestampService';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

    // Fake data
    storage = {
      setting: [{
        label: 'work',
        color: '#FF0000',
      }, {
        label: 'study',
        color: 'blue',
      }, {
        label: 'others',
        color: 'gold',
      }, {
        label: 'game',
        color: 'green',
      }, {
        label: 'sleep',
        color: 'black',
      }],
      defaultSetting: [{
        label: 'work',
        color: '#FF0000',
      }, {
        label: 'study',
        color: 'blue',
      }, {
        label: 'others',
        color: 'gold',
      }, {
        label: 'game',
        color: 'green',
      }, {
        label: 'sleep',
        color: 'black',
      }],
      record: [{
        id: 0,
        timestamp: 0,
        label: 'default',
        color: 'gray',
      }, {
        id: 1,
        timestamp: this.ts.getTimestampToday() - 11000,
        label: 'game',
        color: 'green',
      }, {
        id: 2,
        timestamp: this.ts.getTimestampToday() - 1000,
        label: 'work',
        color: '#FF0000',
      }, {
        id: 3,
        timestamp: this.ts.getTimestampToday() + 1000,
        label: 'study',
        color: 'blue',
      }, {
        id: 4,
        timestamp: this.ts.getTimestampToday() + 2000,
        label: 'others',
        color: 'gold',
      }, {
        id: 5,
        timestamp: this.ts.getTimestampToday() + 4000,
        label: 'game',
        color: 'green',
      }, {
        id: 6,
        timestamp: this.ts.getTimestampToday() + 8000,
        label: 'sleep',
        color: 'black',
      }],
      displayRecordIdList: [],
      editcache: [],
    };

  constructor(
    private ts: TimestampService
    ) {
      // Refresh
      setInterval(() => {
        // Title local time in seconds every 0.5s
        this.ts.showTimeInSeconds('timeNow');

        // Range start and end proportion
        this.propRngStart = this.storage.record[this.storage.record.length - 1].timestamp - this.ts.getTimestampToday() > 0 ?
          (this.storage.record[this.storage.record.length - 1].timestamp - this.ts.getTimestampToday()) / 86400 : 0;
        this.propRngEnd = (this.ts.getTimestampNow() - this.ts.getTimestampToday()) / 86400;

        // Synchronize the cursor in range if not in editing
        if (!this.recordRngEditingFlg) {
          this.lengthTimeSetPosition = this.propRngEnd * this.lengthRngStandard;
          this.timeSet = this.ts.getTimestampNow();
        }
      }, 500);
      // Refresh today display every 1min
      setInterval(() => {
        this.calculateEachDayDisplay(this.ts.getTimestampToday());
      }, 60000);
  }

  // label last
  labelLast = this.storage.record[this.storage.record.length - 1].label;
  // Edit label flag
  labelEditingFlg = 0;
  // Edit range flag
  recordRngEditingFlg = 0;
  // display id and timestamp list
  displayList = [];

  // range length
  lengthRngStandard = 600;
  // range start proportion
  propRngStart = 0;
  // range end proportion
  propRngEnd = (this.ts.getTimestampNow() - this.ts.getTimestampToday()) / 86400;
  // range cursor proportion
  propRngCursor = (this.ts.getTimestampNow() - this.ts.getTimestampToday()) / 86400;
  // range cursor height value
  lengthTimeSetPosition = this.propRngCursor * this.lengthRngStandard;
  // range cursor time set by value
  timeSet = this.ts.getTimestampNow();

  // Added label name
  labelAdded = '';
  // Added label color
  colorAdded = '';
  // length of padding offset of div
  lengthRngPaddingA = this.lengthRngStandard / 48;
  // length of padding offset of input range
  lengthRngPaddingB = this.lengthRngStandard / 96;
  // length full
  lengthRngFull = this.lengthRngStandard * 25 / 24;

  // tslint:disable-next-line: use-life-cycle-interface
  ngOnInit() {
    // TODO get the data from storage
    console.log('Start up');
    // Refresh today display
    this.calculateEachDayDisplay(this.ts.getTimestampToday());
    // Get the setted time from record edit input
    document.getElementById('rangeTime').addEventListener('input', () => {
      this.timeSet = this.ts.getTimestampToday() + Math.floor(this.lengthTimeSetPosition / this.lengthRngStandard * 86400);
      this.recordRngEditingFlg = this.timeSet !== this.ts.getTimestampNow() ? 1 : 0;
    });
  }

  // Add record
  onLabelClick(labelSelected: string) {
    // Same with current label, do noting
    if (this.labelLast === labelSelected) {
      // TODO alert: Current event is the same with button clicked.
      return;
    }
    if (this.timeSet === this.storage.record[this.storage.record.length - 1].timestamp) {
      // TODO alert: Multiple labels at the same time.
      return;
    }
    // Add
    this.storage.record.push({
      // At least one item of record existence promised
      // Record id well sorted and continuous promised
      id: this.storage.record.length,
      timestamp: this.recordRngEditingFlg ? this.timeSet : this.ts.getTimestampNow(),
      label: labelSelected,
      color: this.storage.setting.filter(obj => obj.label === labelSelected)[0].color,
    });
    // Record label last (added)
    this.labelLast = this.storage.record[this.storage.record.length - 1].label;
    // Refresh today display
    this.calculateEachDayDisplay(this.ts.getTimestampToday());
  }

  // Remove record
  onLabelRevert() {
    // Remove
    this.storage.record.pop();
    // Save the default
    if (!this.storage.record.length) {
      this.storage.record.push({
        id: 0,
        timestamp: 0,
        label: 'default',
        color: 'gray',
      });
    }
    // Revert label last
    this.labelLast = this.storage.record[this.storage.record.length - 1].label;
    // Refresh today display
    this.calculateEachDayDisplay(this.ts.getTimestampToday());
  }

  // Add label
  // Setting may be empty
  // Uniqueness ensured
  onLabelAdd(label: string, color: string) {
    if (!label || !color) {
      // TODO may add default option.
      // TODO alert: Please input label name and select color.
    } else if (this.storage.setting.some(obj => obj.label === label)) { // if setting is empty, there is no error.
      // TODO alert: There are {{label}} existed, please select another label name.
    } else if (this.storage.setting.some(obj => obj.color === color)) {
      // TODO alert: There are {{color}} existed, please select another label name.
    } else {
      this.storage.setting.push({label, color});
    }
  }

  // Remove label
  // Only remove the existing label from displayed button
  // Remove the only one of selected
  onLabelDelete(label: string) {
    const itemDelete = this.storage.setting.filter(obj => obj.label === label)[0]; // Uniqueness premised
    const indexOfItemDelete = this.storage.setting.indexOf(itemDelete);
    this.storage.setting.splice(indexOfItemDelete, 1);
  }

  // Edit label
  onLabelEdit() {
    // Reset input label name
    this.labelAdded = '';
    // Reset input label color
    this.colorAdded = '';
    this.labelEditingFlg ? this.labelEditingFlg = 0 : this.labelEditingFlg = 1;
  }

  // Set label to default
  onLabelDefault() {
    // Pass object by reference: NG
    // this.storage.setting = this.storage.defaultSetting;
    // Pass object by value: OK
    this.storage.setting = Object.create(this.storage.defaultSetting);
  }

  // Make common component event processing code
  // For multiple days display
  // Have two situation, one is that past date display, another is today's display
  // Need to consider the border problem
  // Deal with each day
  calculateEachDayDisplay(calDayTimestamp: number) {

    // Initialize
    const timeNow: number = this.ts.getTimestampNow();
    let timeStopCal: number;
    const timeDayStart: number = calDayTimestamp;
    const timeDayEnd: number = timeDayStart + 86400; // 60*60*24
    const resultList: {length: number, label: string, color: string, timestamp: number, id: number}[] = [];
    // Get record data via timestamp in range of today [)
    const recordCal = Object.create(this.storage.record.filter(obj => obj.timestamp >= timeDayStart && obj.timestamp < timeDayEnd));

    // Deal with the top
    // The situation when one event start before the day calculating and last till that day
    // Noticed that we assume there would always be a default record item with timestamp 1970, so it would be added
    if (recordCal.some((obj: { timestamp: number; }) => obj.timestamp !== timeDayStart)) {
      // Find the minimum id
      const recordHeadItemId: number = recordCal.reduce(
        (prev: { id: number; }, curr: { id: number; }) => prev.id < curr.id ? prev : curr).id;
      // Find the record one before minimum via id
      // Assume the uniqueness of data recorded
      const recordHeadItem = Object.create(this.storage.record.filter(obj => obj.id === recordHeadItemId - 1)[0]);
      // Change the record timestamp to today start for calcualte
      recordHeadItem.timestamp = timeDayStart;
      // Add the record in the top of record list for calculate
      recordCal.splice(0, 0, recordHeadItem);
    }

    // Deal with the bottom
    timeStopCal = timeNow >= timeDayStart && timeNow < timeDayEnd ? timeNow : timeDayEnd;

    // Calculate
    for (let i = 0; i < recordCal.length; i++) {
      const timeStart: number = recordCal[i].timestamp;
      const timeEnd: number = i === recordCal.length - 1 ? timeStopCal : recordCal[i + 1].timestamp;
      resultList.push({
        // TODO Attention result 0 posibility, check if affected in HTML
        // Giving more precious calculate results than Math.floor
        // length: Math.floor((timeEnd - timeStart) / 86400 * this.lengthRngStandard),
        length: parseFloat(((timeEnd - timeStart) / 86400 * this.lengthRngStandard).toFixed(2)),
        label: recordCal[i].label,
        color: recordCal[i].color,
        timestamp: timeDayStart,
        id: recordCal[i].id,
      });
    }

    // Give the display data list
    this.displayList = resultList;

    console.log(resultList);
  }

}
