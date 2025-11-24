import { Routes } from "@angular/router";
import { Campaigns } from "./campaigns";
import { CampaignsEdit } from "./campaigns-edit/campaigns-edit";
import { CampaignsEditAddReciepientGroup } from "./campaigns-edit/campaigns-edit-add-reciepient-group/campaigns-edit-add-reciepient-group";

export const campaignsRoutes: Routes = [
  {
    path: 'campaigns',
    children: [
      { path: '', component: Campaigns },
      { path: 'create', component: CampaignsEdit },
      { path: ':id/edit', component: CampaignsEdit },
      { path: ':id/edit/addReciepientGroup', component: CampaignsEditAddReciepientGroup },
    ]
  }
];
