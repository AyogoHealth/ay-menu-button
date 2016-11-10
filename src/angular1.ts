/*! Copyright 2016 Ayogo Health Inc. */

import * as angular from 'angular';
import MenuButtonBehaviour from './index';

const modName = 'ayMenuButton';

angular.module(modName)
.directive('button', function() {
    return {
        restrict: 'E',
        link: function(_$scope, $element) {
            let el = $element[0] as HTMLButtonElement;

            if (el.getAttribute('type') === 'menu' || el.getAttribute('data-type') === 'menu') {
                new MenuButtonBehaviour(el);
            }
        }
    };
});

export default modName;
