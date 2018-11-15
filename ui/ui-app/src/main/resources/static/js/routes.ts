import * as angular from 'angular';
//import app from "./app";

import {app} from './common/module-require';
import '@uirouter/angular';
import 'kylo-services';
import './main/IndexController';
import AccessControlService from './services/AccessControlService';
import LoginNotificationService from "./services/LoginNotificationService";
import { AccessDeniedComponent } from './main/AccessDeniedComponent';
import { HomeComponent } from './main/HomeComponent';

'use strict';

class Route {
    // app: ng.IModule;
    constructor() {
        //  this.app = app;
        /*this.*/
        app.config(["$ocLazyLoadProvider", "$stateProvider", "$urlRouterProvider", this.configFn.bind(this)]);
        /*this.*/
        app.run(['$rootScope', '$state', '$location', "$transitions", "$timeout", "$q", "$uiRouter", "AccessControlService", "AngularModuleExtensionService", "LoginNotificationService",
            this.runFn.bind(this)]);
    }

//var app = angular.module("", ["ngRoute"]);
    configFn($ocLazyLoadProvider: any, $stateProvider: any, $urlRouterProvider: any) {
        $ocLazyLoadProvider.config({
            modules: ['kylo', 'kylo.common', 'kylo.services', 'kylo.feedmgr', 'kylo.feedmgr.templates', 'kylo.opsmgr'],
            asyncLoader: require,
            debug: false
        });

        function onOtherwise(AngularModuleExtensionService: any, $state: any, url: any) {
            var stateData = AngularModuleExtensionService.stateAndParamsForUrl(url);
            if (stateData.valid) {
                $state.go(stateData.state, stateData.params);
            }
            else {
                $state.go('home')
            }
        }

        $urlRouterProvider.otherwise(($injector: any, $location: any) => {
            var $state = $injector.get('$state');
            var svc = $injector.get('AngularModuleExtensionService');
            var url = $location.url();
            if (svc != null) {
                if (svc.isInitialized()) {
                    onOtherwise(svc, $state, url)
                    return true;
                }
                else {
                    $injector.invoke(($window: any, $state: any, AngularModuleExtensionService: any) => {
                        AngularModuleExtensionService.registerModules().then(() => {
                            onOtherwise(AngularModuleExtensionService, $state, url)
                            return true;
                        });
                    });
                    return true;
                }
            }
            else {
                $location.url("/home")
            }
        });

        $stateProvider
            .state('home', {
                url: '/home',
                views: {
                    "content": {
                        component: HomeComponent,
                    }
                },
                resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', ($ocLazyLoad: any) => {
                        // you can lazy load files for an existing module
                        return $ocLazyLoad.load('main/HomeComponent');
                    }]
                }
            })

        //Feed Manager
        $stateProvider.state({
            name: 'feeds.**',
            url: '/feeds',
            lazyLoad: (transition: any) => {
                transition.injector().get('$ocLazyLoad').load('feed-mgr/feeds/module').then(function success(args: any) {
                    //upon success go back to the state
                    $stateProvider.stateService.go('feeds')
                    return args;
                }, function error(err: any) {
                    console.log("Error loading feeds ", err);
                    return err;
                });
            }
        }).state({
            name: 'define-feed.**',
            url: '/define-feed?templateId&templateName&feedDescriptor',
            params: {
                templateId: null,
                templateName: null,
                feedDescriptor: null,
                bcExclude_cloning: null,
                bcExclude_cloneFeedName: null
            },
            lazyLoad: (transition: any) => {
                transition.injector().get('$ocLazyLoad').load('feed-mgr/feeds/define-feed/module').then(function success(args: any) {
                    //upon success go back to the state
                    $stateProvider.stateService.go('define-feed', transition.params())
                    return args;
                }, function error(err: any) {
                    console.log("Error loading define-feed ", err);
                    return err;
                });
            }
        }).state({
            name: 'feed-details.**',
            url: '/feed-details/{feedId}',
            params: {
                feedId: null,
                tabIndex: 0
            },
            lazyLoad: (transition: any, state: any) => {
                transition.injector().get('$ocLazyLoad').load('feed-mgr/feeds/edit-feed/module').then(function success(args: any) {
                    //upon success go back to the state
                    $stateProvider.stateService.go('feed-details', transition.params())
                    return args;
                }, function error(err: any) {
                    console.log("Error loading feed-details ", err);
                    return err;
                });
            }
        }).state({
            name: 'edit-feed.**',
            url: '/edit-feed/{feedId}',
            params: {
                feedId: null
            },
            lazyLoad: (transition: any, state: any) => {
                transition.injector().get('$ocLazyLoad').load('feed-mgr/feeds/edit-feed/module').then(function success(args: any) {
                    //upon success go back to the state
                    $stateProvider.stateService.go('edit-feed', transition.params())
                    return args;
                }, function error(err: any) {
                    console.log("Error loading edit-feed", err);
                    return err;
                });
            }
        })

        $stateProvider.state({
            name: 'categories.**',
            url: '/categories',
            loadChildren: 'feed-mgr/categories/categories.module#CategoriesModule'
        });

        $stateProvider.state({
            name: 'registered-templates.**',
            url: '/registered-templates',
            loadChildren: 'feed-mgr/templates/templates.module#TemplateModule'
        });

        $stateProvider.state({
            name: 'register-template.**',
            url: '/registered-template',
            loadChildren: 'feed-mgr/templates/templates.module#TemplateModule'
        });

        $stateProvider.state({
            name: 'service-level-agreements.**',
            url: '/service-level-agreements',
            loadChildren: 'feed-mgr/sla/sla.module#SLAModule'
        });

        $stateProvider.state({
            name: 'users.**',
            url: '/users',
            loadChildren: 'auth/auth.module#AuthModule'
        });

        $stateProvider.state({
            name: 'groups.**',
            url: '/groups',
            loadChildren: 'auth/auth.module#AuthModule'
        });

        $stateProvider.state({
            name: 'datasources.**',
            url: '/datasources',
            loadChildren: 'feed-mgr/datasources/datasources.module#DataSourcesModule'
        });

        $stateProvider.state({
            name: 'search.**',
            url: '/search',
            loadChildren: 'search/search.module#SearchModule'
        });


        $stateProvider.state({
            name: 'business-metadata.**',
            url: '/business-metadata',
            loadChildren: 'feed-mgr/business-metadata/business-metadata.module#BusinessMetadataModule'
        });

        $stateProvider.state({
            name: 'visual-query.**',
            url: '/visual-query/{engine}',
            params: {
                engine: null
            },
            loadChildren: "feed-mgr/visual-query/visual-query.module#VisualQueryModule"
        });

        //Ops Manager

        $stateProvider.state({ 
            name: 'dashboard.**',
            url: '/dashboard',
            loadChildren: 'ops-mgr/overview/overview.module#OverviewModule' 
        });

        $stateProvider.state({
            name: 'ops-feed-details.**',
            url: '/ops-feed-details/{feedName}',
            params: {
                feedName: null
            },
            loadChildren: 'ops-mgr/feeds/ops-mgr-feeds.module#OpsManagerFeedsModule'
        });

        $stateProvider.state({
            name: 'feed-stats.**',
            url: '/feed-stats/{feedName}',
            loadChildren: 'ops-mgr/feeds/feed-stats/feed-stats.module#FeedStatsModule'
        });

        $stateProvider.state({
            name: 'jobs.**',
            url: '/jobs',
            loadChildren: 'ops-mgr/jobs/jobs.module#JobsModule'
        });

        $stateProvider.state({
            name: 'job-details.**',
            url: '/job-details/{executionId}',
            params: {
                        executionId: null
                    },
            loadChildren: 'ops-mgr/jobs/details/job-details.module#JobDetailsModule'
        });

        $stateProvider.state({
            name: 'service-health.**',
            url: '/service-health',
            loadChildren: 'ops-mgr/service-health/ops-mgr-service-health.module#OpsManagerServiceHealthModule'
        });
        $stateProvider.state({
            name: 'service-details.**',
            url: '/service-details',
            loadChildren: 'ops-mgr/service-health/ops-mgr-service-health.module#OpsManagerServiceHealthModule'
        });

        $stateProvider.state({
            name: 'scheduler.**',
            url: '/scheduler',
            loadChildren: 'ops-mgr/scheduler/ops-mgr-scheduler.module#OpsManagerSchedulerModule'
        })

        $stateProvider.state({ 
            name: 'alerts.**',
            url: '/alerts',
            loadChildren: 'ops-mgr/alerts/alerts.module#AlertsModule' 
        });

        $stateProvider.state({
            name: 'charts.**',
            url: '/charts',
            loadChildren: 'ops-mgr/charts/ops-mgr-charts.module#OpsManagerChartsModule'
        });

        $stateProvider.state({ 
            name: 'domain-types.**',
            url: '/domain-types',
            loadChildren: 'feed-mgr/domain-types/domain-types.module#DomainTypesModule' 
        });

        $stateProvider.state({ 
            name: 'service-level-assessment.**',
            url: '/service-level-assessment/{assessmentId}',
            loadChildren: 'ops-mgr/sla/sla.module#SLAModule' 
        });

        $stateProvider.state({ 
            name: 'service-level-assessments.**',
            url: '/service-level-assessments',
            loadChildren: 'ops-mgr/sla/sla.module#SLAModule' 
        });

        $stateProvider.state({
            name: 'jcr-query.**',
            url: '/admin/jcr-query',
            loadChildren: 'admin/admin.module#AdminModule'
        });

        $stateProvider.state({
            name: 'cluster.**',
            url: '/admin/cluster',
            loadChildren: 'admin/admin.module#AdminModule'
        });

        $stateProvider.state({
            name: 'sla-email-template.**',
            url: '/sla-email-template/:emailTemplateId',
            loadChildren: 'feed-mgr/sla/sla.module#SLAModule'
        });

        $stateProvider.state({
            name: 'sla-email-templates.**',
            url: '/sla-email-templates',
            loadChildren: 'feed-mgr/sla/sla.module#SLAModule'
        });

        $stateProvider.state({
            name: 'projects.**',
            url: '/projects',
            lazyLoad: (transition: any) => {
                transition.injector().get('$ocLazyLoad').load('plugin/projects/module').then(function success(args: any) {
                    //upon success go back to the state
                    $stateProvider.stateService.go('projects')
                    return args;
                }, function error(err: any) {
                    console.log("Error loading projects ", err);
                    return err;
                });
            }
        }).state('project-details.**', {
            url: '/project-details/{projectId}',
            params: {
                projectId: null
            },
            lazyLoad: (transition: any) => {
                transition.injector().get('$ocLazyLoad').load('plugin/projects/module').then(function success(args: any) {
                    //upon success go back to the state
                    $stateProvider.stateService.go('project-details', transition.params())
                    return args;
                }, function error(err: any) {
                    console.log("Error loading projects ", err);
                    return err;
                });
            }
        });

        $stateProvider.state({
            name: 'access-denied',
            url: '/access-denied',
            params: {attemptedState: null},
            views: {
                "content": {
                    component: AccessDeniedComponent,
                }
            },
            resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                loadMyCtrl: ['$ocLazyLoad', ($ocLazyLoad: any) => {
                    // you can lazy load files for an existing module
                    return $ocLazyLoad.load('main/AccessDeniedComponent');
                }]
            }
        });

        $stateProvider.state({
            name: 'catalog.**',
            url: '/catalog',
            loadChildren: 'feed-mgr/catalog/catalog.module#CatalogModule'
        });

        $stateProvider.state({
            name: 'schemas.**',
            url: '/catalog/{datasource}/schemas',
            params: {
                datasource: null
            },
            lazyLoad: (transition: any)=>{
                transition.injector().get('$ocLazyLoad').load('feed-mgr/tables/module').then(function success(args: any) {
                    //upon success go back to the state
                    $stateProvider.stateService.go('schemas', transition.params());
                    return args;
                }, function error(err: any) {
                    console.log("Error loading schemas ", err);
                    return err;
                });
            }
        }).state({
            name: 'schemas-schema.**',
            url: '/catalog/{datasource}/schemas/{schema}',
            params: {
                datasource: null,
                schema: null
            },
            lazyLoad: (transition: any)=>{
                transition.injector().get('$ocLazyLoad').load('feed-mgr/tables/module').then(function success(args: any) {
                    //upon success go back to the state
                    $stateProvider.stateService.go('schemas-schema', transition.params());
                    return args;
                }, function error(err: any) {
                    console.log("Error loading tables ", err);
                    return err;
                });
            }
        }).state({
            name: 'schemas-schema-table.**',
            url: '/catalog/{datasource}/schemas/{schema}/{tableName}',
            params: {
                datasource: null,
                schema: null,
                tableName: null
            },
            lazyLoad: (transition: any)=>{
                transition.injector().get('$ocLazyLoad').load('feed-mgr/tables/module').then(function success(args: any) {
                    //upon success go back to the state
                    $stateProvider.stateService.go('schemas-schema-table', transition.params())
                    return args;
                }, function error(err: any) {
                    console.log("Error loading table ", err);
                    return err;
                });
            }
        });

        $stateProvider.state({
            name: 'feed-definition.**',
            url: '/feed-definition',
            loadChildren: 'feed-mgr/feeds/define-feed-ng2/define-feed.module#DefineFeedModule'
        });

        $stateProvider.state({
            name: 'repository.**',
            url: '/repository',
            loadChildren: 'repository/repository.module#RepositoryModule'
        });

        $stateProvider.state({
            name: 'template-info.**',
            url: '/template-info',
            loadChildren: 'repository/repository.module#RepositoryModule'
        });

        $stateProvider.state({
            name: 'import-template.**',
            url: '/importTemplate',
            loadChildren: 'repository/repository.module#RepositoryModule'
        });
    }

    runFn($rootScope: any, $state: any, $location: any, $transitions: any, $timeout: any, $q: any,
          $uiRouter: any, accessControlService: AccessControlService, AngularModuleExtensionService: any,
          loginNotificationService: LoginNotificationService) {
        //initialize the access control
        accessControlService.init();
        loginNotificationService.initNotifications();

        $rootScope.$state = $state;
        $rootScope.$location = $location;

        $rootScope.typeOf = (value: any) => {
            return typeof value;
        };

        var onStartOfTransition = (trans: any) => {

            if (!accessControlService.isFutureState(trans.to().name)) {
                //if we havent initialized the user yet, init and defer the transition
                if (!accessControlService.initialized) {
                    var defer = $q.defer();
                    $q.when(accessControlService.init(), () => {
                        //if not allowed, go to access-denied
                        if (!accessControlService.hasAccess(trans)) {
                            if (trans.to().name != 'access-denied') {
                                defer.resolve($state.target("access-denied", {attemptedState: trans.to()}));
                            }
                        }
                        else {
                            defer.resolve($state.target(trans.to().name, trans.params()));
                        }
                    });
                    return defer.promise;
                }
                else {
                    if (!accessControlService.hasAccess(trans)) {
                        if (trans.to().name != 'access-denied') {
                            return $state.target("access-denied", {attemptedState: trans.to()});
                        }
                    }
                }
            }
        }

        /**
         * Add a listener to the start of every transition to do Access control on the page
         * and redirect if not authorized
         */
        $transitions.onStart({}, (trans: any) => {
            if (AngularModuleExtensionService.isInitialized()) {
                return onStartOfTransition(trans);
            }
            else {
                var defer = $q.defer();
                $q.when(AngularModuleExtensionService.registerModules(), () => {
                    defer.resolve(onStartOfTransition(trans));
                });
                return defer.promise;
            }

        });
    }
}

const routes = new Route();
export default routes;
