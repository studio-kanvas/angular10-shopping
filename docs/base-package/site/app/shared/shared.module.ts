import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { NextTopicComponent } from './next-topic/next-topic.component';
import { TocService } from './services/toc-service';
import { InfoService } from './services/info-service';
import { ParentRouteComponent } from './parent-route/parent-route.component';
import { NotImplementedComponent } from './not-implemented/not-implemented.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([]),
  ],
  declarations: [NextTopicComponent, ParentRouteComponent, NotImplementedComponent],
  exports: [NextTopicComponent, ParentRouteComponent, NotImplementedComponent, CommonModule, RouterModule],
  providers: [TocService, Title, InfoService]
})
export class SharedModule {
}
