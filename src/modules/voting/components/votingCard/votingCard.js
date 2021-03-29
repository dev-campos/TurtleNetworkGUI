/* eslint-disable no-console */
(function () {
    'use strict';

    const { WAVES_ID } = require('@turtlenetwork/signature-adapter');


    const VotingStatus = {
        Available: 'available',
        NotEligible: 'not_eligible',
        HasVoted: 'has_voted',
        IsClosed: 'is_closed'
    };

    const controller = function (Base, $scope, modalManager, votingService, user, balanceWatcher) {

        class VotingCard extends Base {

            pollData = {}
            currentHeight = 0

            relativeElapsedTime = 0.0
            blocksLeft = 0
            hasVotes = false
            isClosed = true
            isEligible = true
            votes = []
            totalVotes = 0
            userVotedLabel = ''
            votingStatus = VotingStatus.NotEligible


            constructor() {
                super($scope);
            }

            $onInit() {
                this.receive(balanceWatcher.change, this._updateVotingStatus, this);
            }

            $onChanges() {
                const height = this.currentHeight;
                this.relativeElapsedTime = Math.min(height / this.pollData.end, 1.0);
                this.blocksLeft = Math.max(0, this.pollData.end - height);
                this.votes = VotingCard._getCurrentVotesAsNormalized(this.pollData);
                this.totalVotes = this.votes.reduce((acc, { v }) => acc + v, 0);
                this.hasVotes = this.totalVotes > 0;
                const votedOptionForPoll = votingService.getVotedOptionForPoll({
                    pollData: this.pollData,
                    userAddress: user.address
                });
                this.userVotedLabel = votedOptionForPoll && this.pollData.options[votedOptionForPoll].label;
                this._updateVotingStatus();

            }

            vote() {
                modalManager.showVoteModal(this.pollData);
            }


            isVotingEnabled() {
                return this.votingStatus === VotingStatus.Available ||
                    this.votingStatus === VotingStatus.HasVoted;
            }

            isForPremiumUsers() {
                return !this.pollData.anonymous_vote;
            }

            _updateVotingStatus() {
                let status = VotingStatus.Available;

                if (this._isClosed()) {
                    status = VotingStatus.IsClosed;
                } else if (!this._isEligible()) {
                    status = VotingStatus.NotEligible;
                } else if (this._hasVoted()) {
                    status = VotingStatus.HasVoted;
                }

                this.votingStatus = status;
            }

            _isClosed() {
                return this.relativeElapsedTime >= 1;
            }

            _isEligible() {
                return votingService.isEligibleForPoll({
                    pollData: this.pollData,
                    balance: balanceWatcher.getBalance()[WAVES_ID]
                });
            }

            _hasVoted() {
                return !!this.userVotedLabel;
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
                const totalVotes = mappedOptions.reduce((acc, o) => acc + o.votes.length, 0);
                return mappedOptions.reduce((acc, opt, i) => {
                    const prev = acc[i - 1];
                    const voteCount = opt.votes.length;
                    acc.push({
                        c: Colors[i % (Colors.length - 1)],
                        l: opt.label,
                        x: prev ? prev.x + prev.w : 0,
                        w: voteCount / totalVotes,
                        v: voteCount
                    });
                    return acc;
                }, []);

            }

        }

        return new VotingCard();
    };

    controller.$inject = ['Base', '$scope', 'modalManager', 'votingService', 'user', 'balanceWatcher'];

    angular.module('app.voting').component('wVotingCard', {
        bindings: {
            pollData: '<',
            currentHeight: '<',
            accountId: '<',
            balance: '<'
        },
        templateUrl: 'modules/voting/components/votingCard/votingCard.html',
        controller
    });
})();
