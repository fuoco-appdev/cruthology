/* eslint-disable @typescript-eslint/no-empty-function */
import { Controller } from '../controller';
import { ResetPasswordModel } from '../models/reset-password.model';

class ResetPasswordController extends Controller {
  private readonly _model: ResetPasswordModel;

  constructor() {
    super();

    this._model = new ResetPasswordModel();
  }

  public get model(): ResetPasswordModel {
    return this._model;
  }

  public initialize(): void {}

  public dispose(): void {}
}

export default new ResetPasswordController();
