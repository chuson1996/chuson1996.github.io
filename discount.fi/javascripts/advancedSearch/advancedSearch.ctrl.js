/**
 * Created by chuso_000 on 24/10/2015.
 */
try{
    angular.module('advancedSearch');
}catch(e){
    angular.module('advancedSearch',[]);
}

angular.module('advancedSearch')
    .controller('advancedSearchCtrl', function($scope){
        var s = $scope;

        $scope.$on('$viewContentLoaded',
            function(event){
                /* Add scollspy */
                $('[data-spy="scroll"]').each(function () {
                    var $spy = $(this).scrollspy('refresh')
                })
                console.log($('#fixed-nav').length);
            });

        s.init = function () {

        };

        /* Declare filter options */
        s.filterOptions = {};
        
        s.$watch('filterOptions', function (newVal, oldVal) {
            if (newVal !== oldVal){
                /* Check for price filter!  */
                if (s.filterOptions.price == 'noRanges'){}
                else if(s.filterOptions.price == 'ranges' && s.filterOptions.priceFrom && s.filterOptions.priceTo){
                    s.filter.push({

                    })
                }

            }
        }, true);

        /* Declare filter table */
        s.filters = [
            {
                type: 'category',
                name: 'Category',
                value: 'Food',
                sortable:false
            },
            {
                type:'price',
                name:'Price',
                value:{
                    "from":29,
                    "to": 99
                },
                sortable:true
            },{
                type: 'time',
                name: 'Time',
                value:'closing'
            },{
                type: 'typeOfDiscount',
                name: 'Type of discount',
                value: 'promotion'
            },{
                type: 'rating',
                name: 'Rating',
                value:{
                    "from":3,
                    "to":5
                },
                sortable: true
            }];

        /* Assign fake result */
        s.result = [{
            photo: 'http://takemetofoodieheaven.files.wordpress.com/2013/06/img_2577.jpg',
            title: 'Chocolate and Code ribs',
            category: 'Food And Drink',
            typeOfDiscount: 'Discount',
            merchant:'Shanghai Cowboy',
            address: 'Mikonkatu 4, Helsinki',
            oriPrice: 28.00,
            discountPrice: 20.00,
            quantity: 50,
            remaining: '6 days 5 hours 20 minutes',
            rating: 3,
            noReviews:122,
            noViews: 222
        }, {
            photo: 'https://asiakas.kotisivukone.com/files/hoku.helsinki.palvelee.fi/.album/1354036130923_1_large.jpg',
            title: 'Braised Crispi Pork Belly',
            category: 'Food And Drink',
            typeOfDiscount: 'Point saving',
            merchant: 'Hoku',
            address: 'Merimiehenkatu 18, Helsinki',
            oriPrice: 25.00,
            discountPrice: 20.00,
            quantity: 100,
            remaining: '5 hours 20 minutes',
            rating: 2,
            noReviews: 115,
            noViews: 300
        }, {
            photo: 'http://www.ravintolaborneo.fi/wp-content/uploads/2014/04/menu_satay_nasi_7.jpg',
            title: 'Satay Ayan Masi Kelapa',
            category: 'Food And Drink',
            typeOfDiscount: 'Promotion',
            merchant: 'Ravintola Bomeo',
            address: 'Ilmarinkatu 8, Tampere',
            oriPrice: 26.00,
            discountPrice: 18.00,
            quantity: 20,
            remaining: '1 day 3 hours 15 minutes',
            rating: 5,
            noReviews: 75,
            noViews: 99
        }, {
            photo: 'http://cdn.blessthisstuff.com/imagens/stuff/sushi-bazooka-5.jpg',
            title: 'Norimaki',
            category: 'Food And Drink',
            typeOfDiscount: 'Discount',
            merchant: 'Norimaki',
            address: 'Eerikinkatu 16, Tampere',
            oriPrice: 12.00,
            discountPrice: 8.00,
            quantity: 20,
            remaining: '4 days 10 hours 10 minute',
            rating: 4,
            noReviews: 42,
            noViews: 57
        }, {
            photo: 'http://montedaquintaresort.com/uploads/media/photos/spa-couple.jpg',
            title: 'ESPA Body Treatments',
            category: 'Beauty And Spa',
            typeOfDiscount: 'Discount',
            merchant: 'Kamp Spa',
            address: 'Kluuvikatu 48 8th floor, Helsinki',
            oriPrice: 45.00,
            discountPrice: 35.00,
            quantity: 15,
            remaining: '7 hours 3 minutes',
            rating: 3,
            noReviews: 35,
            noViews: 89
        }];
    });



