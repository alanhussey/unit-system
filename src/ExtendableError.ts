export default abstract class ExtendableError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = new.target.name;
  }
}
