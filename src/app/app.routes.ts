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

export const routes: Routes = [
  { path: '', component: IndexOneComponent },

  { path: 'whatsapp', component: WhatsAppComponent },
  { path: 'send-message', component: SendMessageComponent },
  { path: 'clients', component: ClientsComponent },
  { path: 'groups', component: GroupsComponent },
  { path: 'token', component: TokensComponent },
  { path: 'api-instructions', component: ApiInstructionsComponent },
  
  
  { path: '404', component: ErrorComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'about-us', component: AboutUsComponent },


  { path: 'create-account', component: CreateAccountComponent },

];
