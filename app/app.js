var myApp = angular.module("myApp", []);

// Main controller
myApp.controller("appCtrl", ["$scope", "$http", "$q", function ($scope, $http, $q) {

  // Get all stations data
  $http.get("./data/allstations.json").then(function(response){
    $scope.stations = response.data;
  }).catch(function(err){
    console.error(err);
  });

  // Select a station to load train compositions
  $scope.loadTrains = function(){

    // Get data of a selected station
    $http.get("https://rata.digitraffic.fi/api/v1/live-trains", {
      params: {station: $scope.selectedStation.stationShortCode}
    }).then(function(response){
      $scope.trains = response.data;
      //console.log(response.data);

      // Mapping the stations requests into an array of promises of trains compositions
      var compositionPromises = $scope.trains.map(function(compo){
        return $http.get("https://rata.digitraffic.fi/api/v1/compositions/" + compo.trainNumber, {
          params: { departure_date: compo.departureDate }
        }).then(function (response) {

          // Assign this set of compositions to the train
          compo.compositions = response.data;
        });
      });

      // Resolve the promises
      return $q.all(compositionPromises);
    }).catch(function(err){
      console.error(err);
    });
  };
}]);
