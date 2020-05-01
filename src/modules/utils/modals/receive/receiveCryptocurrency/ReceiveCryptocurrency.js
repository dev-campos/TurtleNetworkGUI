(function () {
    'use strict';

    const { Money } = require('@waves/data-entities');

    /**
     * @param {typeof Base} Base
     * @param {ng.IScope} $scope
     * @param {GatewayService} gatewayService
     * @param {User} user
     * @return {ReceiveCryptocurrency}
     */
    const controller = function (Base, $scope, gatewayService, user) {

        /**
         * @extends {ng.IController}
         */
        class ReceiveCryptocurrency extends Base {

            /**
             * @type {Asset}
             */
            asset = null;

            /**
             * @type {Array}
             */
            cryptocurrencies;

            /**
             * @type {boolean}
             */
            isSingleAsset;

            /**
             * @type {string}
             */
            assetKeyName;

            /**
             * @type {string}
             */
            gatewayAddress;

            /**
             * @type {string}
             */
            gatewayType;

            /**
             * @type {string}
             */
            gatewayUrl;

            /**
             * @type {boolean}
             */
            gatewayServerError = false;

            /**
             * @type {boolean}
             */
            gatewayServerPending = false;

            /**
             * @type {boolean}
             */
            isWEST;

            /**
             * @type {string}
             */
            chosenAssetId = null;

            /**
             * @type {Function}
             */
            onAssetChange;

            /**
             * @type {Money | null}
             */
            minAmount = null;

            /**
             * @type {string}
             */
            supportEmail = null;

            /**
             * @type {string}
             */
            disclaimerLink = null;

            /**
             * @type {string}
             */
            operator = null;

            /**
             * @type {Money | null}
             */
            minRecoveryAmount = null;

            /**
             * @type {Money | null}
             */
            recoveryFee = null;

            /**
             * @type {Money | null}
             */
            maxAmount = null;

            /**
             * @type {string}
             */
            walletAddress = null;

            constructor() {
                super();

                this.observe('chosenAssetId', ({ value: id }) => this.onAssetChange({ id }));

                this.observe('asset', this.updateGatewayAddress);
            }

            /**
             * @public
             */
            updateGatewayAddress() {
                this.gatewayServerError = false;
                this.gatewayServerPending = true;
                if (!this.asset) {
                    const gatewayList = WavesApp.network.wavesGateway;
                    this.asset = gatewayList[Object.keys(gatewayList)[0]];
                }

                const depositDetails = gatewayService.getDepositDetails(this.asset, user.address);

                if (depositDetails) {
                    depositDetails.then((details) => {

                        if (details.gatewayType === 'deposit') {
                            gatewayService.getDepositAddress(this.asset, user.address).then(result => {
                                this.gatewayAddress = result.address;
                            });
                        } else {
                            this.gatewayAddress = details.address;
                        }
                        this.minAmount = Money.fromTokens(details.minimumAmount, this.asset);
                        this.maxAmount = Money.fromTokens(details.maximumAmount, this.asset);
                        this.disclaimerLink = details.disclaimerLink;
                        this.minRecoveryAmount = Money.fromTokens(details.minRecoveryAmount, this.asset);
                        this.recoveryFee = Money.fromTokens(details.recoveryFee, this.asset);
                        this.supportEmail = details.supportEmail;
                        this.operator = details.operator;
                        this.gatewayServerPending = false;
                        this.walletAddress = details.walletAddress;
                        this.gatewayType = details.gatewayType;
                        this.gatewayUrl = details.gatewayUrl;
                        $scope.$apply();
                    }, () => {
                        this.minAmount = Money.fromTokens(0.001, this.asset);
                        this.gatewayAddress = null;
                        this.gatewayServerError = true;
                        this.gatewayServerPending = false;
                        $scope.$apply();
                    });

                    this.assetKeyName = gatewayService.getAssetKeyName(this.asset, 'deposit');
                    this.isWEST = false;
                }
            }

        }

        return new ReceiveCryptocurrency();
    };

    controller.$inject = ['Base', '$scope', 'gatewayService', 'user'];

    angular.module('app.utils').component('wReceiveCryptocurrency', {
        controller,
        bindings: {
            asset: '<',
            cryptocurrencies: '<',
            isSingleAsset: '<',
            onAssetChange: '&'
        },
        templateUrl: 'modules/utils/modals/receive/receiveCryptocurrency/receive-cryptocurrency.html'
    });
})();
