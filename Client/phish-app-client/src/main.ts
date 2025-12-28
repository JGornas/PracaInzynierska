import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import Swal from 'sweetalert2';

// Swal.mixin({
//   confirmButtonColor: '#3a5891',
// });

bootstrapApplication(App, appConfig);
