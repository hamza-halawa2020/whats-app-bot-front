import { Routes } from '@angular/router';
import { IndexOneComponent } from './pages/index/index-one.component';

import { ErrorComponent } from './pages/error/error.component';
import { CreateAccountComponent } from './pages/create-account/create-account.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { WhatsAppComponent } from './pages/whatsApp/whatsapp.component';
import { SendMessageComponent } from './pages/SendMessage/send-message.component';
import { GroupsComponent } from './pages/groups/groups.component';
import { TokensComponent } from './pages/token/token.component';
import { WalletComponent } from './pages/wallet/wallet.component';
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';
import { AuthGuard } from './guards/auth.guard';
import { UnauthGuard } from './guards/unauth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: IndexOneComponent },

  // Protected routes (require authentication)
  { path: 'whatsapp', component: WhatsAppComponent, canActivate: [AuthGuard] },
  { path: 'send-message', component: SendMessageComponent, canActivate: [AuthGuard] },
  { path: 'clients', component: ClientsComponent, canActivate: [AuthGuard] },
  { path: 'groups', component: GroupsComponent, canActivate: [AuthGuard] },
  { path: 'token', component: TokensComponent, canActivate: [AuthGuard] },
  { path: 'wallet', component: WalletComponent, canActivate: [AuthGuard] },
  { path: 'admin/users', component: AdminUsersComponent, canActivate: [AuthGuard, AdminGuard] },
  
  // Public routes
  { path: '404', component: ErrorComponent },

  // Auth routes (only accessible when not authenticated)
  { path: 'create-account', component: CreateAccountComponent, canActivate: [UnauthGuard] },

];
