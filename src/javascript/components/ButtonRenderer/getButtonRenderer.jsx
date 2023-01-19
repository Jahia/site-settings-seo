import {useTranslation} from 'react-i18next';
import {Button, Report} from '@jahia/moonstone';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './getButtonRenderer.scss';
//Copy of the button renderer from content editor
//The code has been copied here because the ButtonRenderer from content editor is available from the version 4.3.0 of content editor
//TODO this could be removed once CE 4.3.0 is the minimal version of content-editor
export const getButtonRenderer = ({labelStyle, defaultButtonProps, noIcon} = {}) => {
    const ButtonRenderer = props => {
        const {addWarningBadge, buttonLabelNamespace, buttonLabelShort, buttonLabel, isVisible, buttonLabelParams, buttonIcon, actionKey, enabled, disabled, onClick, buttonProps, dataSelRole, className} = props;
        const {t} = useTranslation(buttonLabelNamespace);

        let label = buttonLabel;
        if (labelStyle === 'none') {
            label = null;
        } else if (labelStyle === 'short' && buttonLabelShort) {
            label = buttonLabelShort;
        }

        let icon;
        if (!noIcon) {
            icon = buttonIcon;
        }

        if (isVisible === false) {
            return false;
        }

        let button = (
            <Button data-sel-role={dataSelRole || actionKey}
                    className={className}
                    label={t(label, buttonLabelParams)}
                    icon={icon}
                    isDisabled={enabled === false || disabled}
                    onClick={e => {
                        e.stopPropagation();
                        onClick(props, e);
                    }}
                    {...defaultButtonProps}
                    {...buttonProps}
            />
        );

        return (
            <>
                {button}
                {addWarningBadge && (
                    <Report size="big" data-sel-role={`${actionKey}_pastille`} className={styles.warningBadge}/>
                )}
            </>
        );
    };

    ButtonRenderer.propTypes = {
        buttonLabelNamespace: PropTypes.string,
        buttonLabelShort: PropTypes.string,
        buttonLabel: PropTypes.string,
        isVisible: PropTypes.bool,
        buttonLabelParams: PropTypes.object,
        buttonIcon: PropTypes.node,
        actionKey: PropTypes.string,
        enabled: PropTypes.bool,
        disabled: PropTypes.bool,
        onClick: PropTypes.func,
        buttonProps: PropTypes.object,
        addWarningBadge: PropTypes.bool,
        dataSelRole: PropTypes.string,
        className: PropTypes.string
    };

    return ButtonRenderer;
};

export const ButtonRenderer = getButtonRenderer();
