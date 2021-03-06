var app =
    angular.module('persons', ['ngResource', 'ngGrid', 'ui.bootstrap']);

app.factory('personService', function($resource) {
    return $resource('resources/persons/:id');
});

app.controller('personsListController', function($scope, $rootScope, personService) {

    $scope.sortInfo = {
        fields: ['id'],
        directions: ['asc']
    };

    $scope.persons = {
        currentPage: 1
    };

    $scope.gridOptions = {
        data: 'persons.list',
        useExternalSorting: true,
        sortInfo: $scope.sortInfo,


        columnDefs: [{
            field: 'id',
            displayName: 'Id'
        }, {
            field: 'name',
            displayName: 'Name'
        }, {
            field: 'description',
            displayName: 'Description'
        }, {
            field: '',
            width: 30,
            cellTemplate: '<span class="glyphicon glyphicon-remove remove" ng-click="deleteRow(row)"></span>'
        }],

        multiSelect: false,

        selectedItems: [],

        afterSelectionChange: function(rowItem) {
            if (rowItem.selected) {
                $rootScope.$broadcast('personSelected', $scope.gridOptions.selectedItems[0].id);
            }
        }
    };

    $scope.refreshGrid = function() {
        var listPersonsArgs = {
            page: $scope.persons.currentPage,
            sortFields: $scope.sortInfo.fields[0],
            sortDirections: $scope.sortInfo.directions[0]
        };

        personService.get(listPersonsArgs, function(data) {
            $scope.persons = data;
        });
    };

    $scope.deleteRow = function(row) {
        $rootScope.$broadcast('deltePerson', row.entity.id);
    };

    $scope.$watch('sortInfo', function() {
        $scope.persons = {
            currentPage: 1
        };

        $scope.refreshGrid();
    }, true);

    $scope.$on('ngGridEventSorted', function(event, sortInfo) {
        $scope.sortInfo = sortInfo;
    });

    $scope.$on('refreshGrid', function() {
        $scope.refreshGrid();
    });

    $scope.$on('clear', function() {
        $scope.gridOptions.selectAll(false);
    });
});

app.controller('personsFormController', function($scope, $rootScope, personService) {

    $scope.clearForm = function() {
        $scope.person = null;

        document.getElementById('imageUrl').value = null;

        $scope.personForm.$setPristine();

        $rootScope.$broadcast('clear');
    };

    $scope.updatePerson = function() {
        personService.save($scope.person).$promise.then(
            function(){
                $rootScope.$broadcast('refreshGrid');
                $rootScope.$broadcast('personSaved');
                $scope.clearForm();
            },

            function(){
                $rootScope.$broadcast('error');
            }
        );
    };

    $scope.$on('deltePerson', function(event, id) {
        personService.delete({ id: id }).$promise.then(
            function() {
                $rootScope.$broadcast('refreshGrid');
                $rootScope.$broadcast('personDeleted');
                $scope.clearForm();
            },

            function(){
                $rootScope.$broadcast('error');
            }
        );
    });

    $scope.$on('personSelected', function(event, id){
        $scope.person = personService.get({id: id});
    });
});
