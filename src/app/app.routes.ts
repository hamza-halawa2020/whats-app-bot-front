import { Routes } from '@angular/router';
import { IndexOneComponent } from './pages/index/index-one.component';

import { ErrorComponent } from './pages/error/error.component';
import { ContactComponent } from './pages/contact/contact.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { CreateAccountComponent } from './pages/create-account/create-account.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { WhatsAppComponent } from './pages/whatsApp/whatsapp.component';
import { SendMessageComponent } from './pages/SendMessage/send-message.component';
import { GroupsComponent } from './pages/groups/groups.component';
import { TokensComponent } from './pages/token/token.component';
import { ApiInstructionsComponent } from './pages/ApiInstructions/api-instructions.component';
import { AuthGuard } from './guards/auth.guard';
import { UnauthGuard } from './guards/unauth.guard';

export const routes: Routes = [
  { path: '', component: IndexOneComponent },

  // Protected routes (require authentication)
  { path: 'whatsapp', component: WhatsAppComponent, canActivate: [AuthGuard] },
  { path: 'send-message', component: SendMessageComponent, canActivate: [AuthGuard] },
  { path: 'clients', component: ClientsComponent, canActivate: [AuthGuard] },
  { path: 'groups', component: GroupsComponent, canActivate: [AuthGuard] },
  { path: 'token', component: TokensComponent, canActivate: [AuthGuard] },
  
  // Public routes
  { path: 'documentation', component: ApiInstructionsComponent},
  { path: '404', component: ErrorComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'about-us', component: AboutUsComponent },

  // Auth routes (only accessible when not authenticated)
  { path: 'create-account', component: CreateAccountComponent, canActivate: [UnauthGuard] },

];
