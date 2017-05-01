import React from 'react';
import PropTypes from 'prop-types';

import {ipcRenderer, shell} from 'electron';

export default class Item extends React.Component {
    render() {
        return (
            <li className="list-group-item">
                <div className="media-body">
                    <strong><a href="#" onClick={this.openLink.bind(this)} style={{cursor: 'pointer'}}>{this.props.url}</a></strong>
                    <p>
                        {this.props.title}
                        <span className="icon icon-trash pull-right" onClick={this.remove.bind(this)}></span>
                    </p>
                </div>
            </li>
        );
    }

    openLink(e) {
        shell.openExternal(e.target.innerHTML);
    }

    remove() {
        ipcRenderer.send('remove', this.props.index);
    }
}