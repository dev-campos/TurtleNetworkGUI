(function () {
    'use strict';

    /**
     * @param Base
     * @param {$rootScope.Scope} $scope
     * @param createPoll
     * @param {app.utils} utils
     * @param {Waves} waves
     * @param {User} user
     * @param {BalanceWatcher} balanceWatcher
     * @return {VoteModalCtrl}
     */
    const controller = function (Base, $scope, createPoll, utils, waves, user, balanceWatcher) {

        // const entities = require('@waves/data-entities');
        const { SIGN_TYPE } = require('@turtlenetwork/signature-adapter');

        const ds = require('data-service');

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


                // console.log('pollData', pollData)

                /**
                 * Vote, selected by user
                 * @type {number}
                 */
                this.vote = null;


                /**
                 * @type {'burn'|'reissue'}
                 */
                // this.txType = txType;
                /**
                 * @type {ExtendedAsset}
                 */
                // this.asset = money.asset;
                /**
                 * @type {boolean}
                 */
                // this.issue = money.asset.reissuable;
                /**
                 * @type {BigNumber}
                 */
                // this.maxCoinsCount = WavesApp.maxCoinsCount.sub(money.asset.quantity);
                /**
                 * @type {Money}
                 */
                // this.balance = money;
                /**
                 * @type {Money}
                 */
                // this.precision = money.asset.precision;
                /**
                 * @type {Precision}
                 */
                this.input = null;
                /**
                 * @type {Money}
                 */
                // this.quantity = new entities.Money(this.asset.quantity, this.asset);
                /**
                 * @type {Money}
                 * @private
                 */
                this._waves = null;


                this.description = ''; // description || money.asset.description;


                const type = SIGN_TYPE.SCRIPT_INVOCATION;
                // waves.node.getFee({ type, assetId: money.asset.id }).then((fee) => {
                //     this.fee = fee;
                //     $scope.$digest();
                // });

                // createPoll(this, this._getGraphData, 'chartData', 15000);
                // ds.api.assets.get(WavesApp.defaultAssets.TN).then(asset => {
                //     this.receive(balanceWatcher.change, () => this._updateWavesBalance(asset));
                //     this._updateWavesBalance(asset);
                // });

                // this.observe(['input', 'issue'], this._createTx);
                // this.observe(['_waves', 'fee'], this._changeHasFee);

                this.observe(['vote'], this._createTx);

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

            /**
             * @private
             */
            _changeHasFee() {
                if (!this._waves || !this.fee) {
                    return null;
                }

                this.noFee = this._waves.lt(this.fee);
            }

            /**
             * @private
             */
            async _createTx() {
                if (!this.vote) {
                    this.signable = null;
                    return;
                }

                const txData = {
                    type: SIGN_TYPE.SCRIPT_INVOCATION,
                    version: 1,
                    // TODO: make configurable
                    dApp: '3Xs2fU5anbFLY4KfPTWqa2AxkBkFJzdMw9c',
                    fee: 100000000,
                    feeAssetId: null,
                    payment: [],
                    call: {
                        function: 'vote',
                        args: [
                            {
                                type: 'integer',
                                value: this.pollData.id
                            },
                            {
                                type: 'integer',
                                value: this.vote
                            }
                        ]
                    }
                };

                const [tx] = await ds.api.transactions.parseTx([txData]);
                this.signable = ds.signature.getSignatureApi().makeSignable({
                    type: txData.type,
                    data: tx
                });
            }

        }

        return new VoteModalCtrl(this);
    };

    controller.$inject = ['Base', '$scope', 'createPoll', 'utils', 'waves', 'user', 'balanceWatcher'];

    angular.module('app.utils').controller('VoteModalCtrl', controller);
})();
