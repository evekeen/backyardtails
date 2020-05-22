import {filterMessages, StatusMessage} from '../src/reducers/status';

describe('status', () => {
  it('unique', () => {
    const log: StatusMessage[] = [
      {type: 'turn', text: 'turn-1'},
      {type: 'info', text: 'info-1'},
      {type: 'death', text: 'death-1'},
      {type: 'turn', text: 'turn-2'},
      {type: 'info', text: 'info-2'},
      {type: 'victory', text: 'victory-2'},
    ];
    const filtered = filterMessages(log);
    expect(filtered).toStrictEqual([
      {type: 'death', text: 'death-1'},
      {type: 'turn', text: 'turn-2'},
      {type: 'info', text: 'info-2'},
      {type: 'victory', text: 'victory-2'},
    ]);
  });

  it('new round after victory', () => {
    const log: StatusMessage[] = [
      {type: 'turn', text: 'turn-1'},
      {type: 'info', text: 'info-1'},
      {type: 'death', text: 'death-1'},
      {type: 'turn', text: 'turn-2'},
      {type: 'info', text: 'info-2'},
      {type: 'victory', text: 'victory-2'},
      {type: 'turn', text: 'turn-3'}
    ];
    const filtered = filterMessages(log);
    expect(filtered).toStrictEqual([
      {type: 'death', text: 'death-1'},
      {type: 'info', text: 'info-2'},
      {type: 'victory', text: 'victory-2'},
      {type: 'turn', text: 'turn-3'}
    ]);
  });

  it('turn made after victory', () => {
    const log: StatusMessage[] = [
      {type: 'turn', text: 'turn-1'},
      {type: 'info', text: 'info-1'},
      {type: 'death', text: 'death-1'},
      {type: 'turn', text: 'turn-2'},
      {type: 'info', text: 'info-2'},
      {type: 'victory', text: 'victory-2'},
      {type: 'turn', text: 'turn-3'},
      {type: 'info', text: 'info-3'}
    ];
    const filtered = filterMessages(log);
    expect(filtered).toStrictEqual([
      {type: 'turn', text: 'turn-3'},
      {type: 'info', text: 'info-3'},
    ]);
  });

  it('kill after victory', () => {
    const log: StatusMessage[] = [
      {type: 'turn', text: 'turn-1'},
      {type: 'info', text: 'info-1'},
      {type: 'death', text: 'death-1'},
      {type: 'turn', text: 'turn-2'},
      {type: 'info', text: 'info-2'},
      {type: 'victory', text: 'victory-2'},
      {type: 'turn', text: 'turn-3'},
      {type: 'info', text: 'info-3'},
      {type: 'death', text: 'death-3'},
    ];
    const filtered = filterMessages(log);
    expect(filtered).toStrictEqual([
      {type: 'turn', text: 'turn-3'},
      {type: 'info', text: 'info-3'},
      {type: 'death', text: 'death-3'},
    ]);
  });
});