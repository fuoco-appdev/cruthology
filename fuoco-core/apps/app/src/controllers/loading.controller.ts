import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { Controller } from "../controller";
import { LandingModel } from "../models/loading.model";
import AuthService from '../services/auth.service';

class LoadingController extends Controller {
    private readonly _model: LandingModel;

    constructor() {
        super();

        this._model = new LandingModel();
        
        this.onAuthStateChanged = this.onAuthStateChanged.bind(this);

        AuthService.supabaseClient.auth.onAuthStateChange(this.onAuthStateChanged)
    }

    public get model(): LandingModel {
        return this._model;
    }

    public updateIsLoading(isLoading: boolean): void {
        this._model.isLoading = isLoading;
    }

    private onAuthStateChanged(event: AuthChangeEvent, session: Session | null): void {
        if (event === 'SIGNED_IN') {
            this._model.isLoading = false;
        }
    }
}

export default new LoadingController();