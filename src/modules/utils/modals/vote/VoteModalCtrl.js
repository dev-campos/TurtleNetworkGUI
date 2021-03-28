(function () {
    'use strict';

    const controller = function (Base, $scope, createPoll, utils, waves, user, balanceWatcher, votingService) {

        class VoteModalCtrl extends Base {

            /**
             * @type {args}
             */
            signPending = false;
            /**
             * @type {Array}
             * @private
             */
            _listeners = [];

            constructor({ pollData }) {
                super($scope);
                /**
                 * @type {number}
                 */
                this.step = 0;
                this.pollData = pollData;

                /**
                 * Vote, selected by user
                 * @type {number}
                 */
                this.vote = null;

                /**
                 * @type {Money}
                 * @private
                 */
                this._waves = null;

                this.observe(['vote'], () => this._signVote());

                const signPendingListener = $scope.$on('signPendingChange', (event, data) => {
                    this.signPending = data;
                });

                this._listeners.push(signPendingListener);
            }

            $onDestroy() {
                super.$onDestroy();
                this._listeners.forEach(listener => listener());
            }

            getSignable() {
                return this.signable;
            }

            next() {
                this.step++;
            }

            /**
             * @param {Asset} asset
             * @private
             */
            _updateWavesBalance(asset) {
                this._waves = balanceWatcher.getBalanceByAsset(asset);
                utils.safeApply($scope);
            }

            _changeHasFee() {
                if (!this._waves || !this.fee) {
                    return null;
                }

                this.noFee = this._waves.lt(this.fee);
            }

            async _signVote() {
                this.signable = await votingService.signVote({
                    pollId: this.pollData.id, voteId: this.vote
                });
            }

        }

        return new VoteModalCtrl(this);
    };

    controller.$inject = ['Base', '$scope', 'createPoll', 'utils', 'waves', 'user', 'balanceWatcher', 'votingService'];

    angular.module('app.utils').controller('VoteModalCtrl', controller);
})();
