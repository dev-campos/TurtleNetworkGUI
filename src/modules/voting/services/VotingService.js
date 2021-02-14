(function () {
    'use strict';

    /**
     * @param {Waves} waves
     * @return {VotingService}
     */
    const factory = function (waves) {

        class VotingService {

            fetchPolls() {
                return Promise.resolve([]);
            }

        }

        return new VotingService();
    };

    factory.$inject = ['waves'];

    angular.module('app.voting').factory('votingService', factory);
})();
