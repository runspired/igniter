export default class Token {
  constructor(parent?: Token);

  _cancelled: boolean;
  _parent: Token;

  cancel(): void;
}
