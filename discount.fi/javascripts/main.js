/*global  angular:false */
'use strict';
angular.module('discountApp',['ui.router','postDeal','viewDeal','advancedSearch'])
	.config(function($stateProvider, $urlRouterProvider){
		$urlRouterProvider.otherwise("/home");
		$stateProvider
			.state('home',{
				url: '/home',
				views:{
					'header':{
						templateUrl: 'header.html',
					},
					'body':{
						templateUrl:'home-body2.html',
						controller:'viewDealHomeCtrl'
					}
				}
			})
			.state('home2',{
				url:'/home2',
				views:{
					'header':{
						templateUrl:'header.html'
					},
					'body':{
						templateUrl:'home-body.html',
					}
				}
			})
			.state('postDeal',{
				url: '/postDeal',
				views:{
					'header':{
						templateUrl: 'header.html',
					},
					'body':{
						templateUrl:'post-deal.html',
                        controller:'postDealCtrl'
					}
				}
			})
			.state('viewDeal',{
				url: '/deal/:dealName',
				views:{
					header:{
						templateUrl: 'header.html',
					},
					'body':{
						templateUrl:'deal.html',
						controller:'viewDealCtrl'
					}
				}
			})
            .state('advancedSearch',{
                url: '/advanced-search',
                views:{
                    header:{
                        templateUrl: 'header.html'
                    },
                    'body':{
                        templateUrl:'advanced-search.html',
                        controller:'advancedSearchCtrl'
                    }
                }
            })


	});  