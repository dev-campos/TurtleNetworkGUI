/* eslint-disable no-console */
(function () {
    'use strict';

    /**
     *
     * @param {Base} Base
     * @param {$rootScope.Scope} $scope
     * @return {VotingCard}
     */
    const controller = function (Base, $scope) {

        class VotingCard extends Base {

            pollData = {}
            currentHeight = 0

            relativeElapsedTime = 0.0
            blocksLeft = 0
            hasVotes = false
            isClosed = true
            isEligible = true
            isLoading = true
            votes = []

            constructor() {
                super($scope);
            }

            $onInit() {
                const height = this.currentHeight;
                this.relativeElapsedTime = Math.min(height / this.pollData.end, 1.0);
                this.blocksLeft = Math.max(0, this.pollData.end - height);
                this.isClosed = this.relativeElapsedTime >= 1;
                this.hasVotes = VotingCard._hasVotes(this.pollData);
                this.votes = VotingCard._getCurrentVotesAsNormalized(this.pollData);
                this.isLoading = false;
            }

            static _hasVotes(polldata) {
                return Object.keys(polldata.options).some(k => polldata.options[k].votes > 0);
            }

            static _getCurrentVotesAsNormalized(pollData) {

                const Colors = [
                    '#a4ec9b',
                    '#5a81ea',
                    '#a6c1b7',
                    '#e36569',
                    '#008b55',
                    '#efa141'
                    // ... add more if needed
                ];

                const { options } = pollData;
                const mappedOptions = Object.keys(options).map(k => options[k]);
                const totalVotes = mappedOptions.reduce((acc, o) => acc + o.votes, 0);
                return mappedOptions.reduce((acc, opt, i) => {
                    const prev = acc[i - 1];
                    acc.push({
                        c: Colors[i % (Colors.length - 1)],
                        l: opt.label,
                        x: prev ? prev.x + prev.w : 0,
                        w: opt.votes / totalVotes,
                        v: opt.votes
                    });
                    return acc;
                }, []);

            }

        }

        return new VotingCard();
    };

    controller.$inject = ['Base', '$scope'];

    angular.module('app.voting').component('wVotingCard', {
        bindings: {
            pollData: '<',
            currentHeight: '<'
        },
        templateUrl: 'modules/voting/components/votingCard.html',
        controller
    });
})();
