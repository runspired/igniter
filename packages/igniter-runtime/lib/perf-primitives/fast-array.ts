import { UNDEFINED_KEY, SMALL_ARRAY_LENGTH } from './-constants';

export default class FastArray {
  constructor(length = SMALL_ARRAY_LENGTH, name = 'Unknown Pool') {
    this.init(length, name);
  }

  init(length = SMALL_ARRAY_LENGTH, name = 'Unknown Pool') {
    this.name = name;
    this.length = 0;
    this._length = length;
    this._data = new Array(length);
  }

  get(index) {
    if (index >= 0 && index < this.length) {
      return this._data[index];
    }

    return undefined;
  }

  set(index, value) {
    if (index > this.length) {
      throw new Error("Index is out of array bounds.");
    }

    if (index === this.length) {
      this.length++;
    }

    this._data[index] = value;
  }

  remove(index) {
    if (index > this.length - 1) {
      throw new Error("Index is out of array bounds.");
    }
    this._data[index] = UNDEFINED_KEY;
  }

  forEach(cb) {
    for (let i = 0; i < this.length; i++) {
      cb(this._data[i], i);
    }
  }

  emptyEach(cb) {
    for (let i = 0; i < this.length; i++) {
      if (this._data[i] !== UNDEFINED_KEY) {
        cb(this._data[i], i);
      }
      this._data[i] = undefined;
    }

    this.length = 0;
  }

  empty() {
    for (let i = 0; i < this.length; i++) {
      this._data[i] = undefined;
    }

    this.length = 0;
  }

  mapInPlace(cb) {
    for (let i = 0; i < this.length; i++) {
      if (this._data[i] !== UNDEFINED_KEY) {
        cb(this._data[i], i);
      }
    }
  }

  map(cb) {
    let arr = new FastArray(this._length, this.name);

    for (let i = 0, j = 0; i < this.length; i++, j++) {
      if (this._data[i] !== UNDEFINED_KEY) {
        arr._data[j] = cb(this._data[i], j);
      } else {
        j--;
      }
    }

    return arr;
  }

  push(item) {
    let index = this.length++;

    if (index === this._length) {
      this._length *= 2;
      this._data.length = this._length;
    }

    this._data[index] = item;

    return index;
  }

  pop() {
    let index = --this.length;
    let v;

    if (index < 0) {
      this.length = 0;
      return undefined;
    }

    v =  this._data[index];

    if (v === UNDEFINED_KEY) {
      return this.pop();
    }

    return v;
  }

}
