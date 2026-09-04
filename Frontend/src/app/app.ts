import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HvToast } from './shared/ui/hv-toast';

@Component({
  imports: [RouterOutlet, HvToast],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {}
