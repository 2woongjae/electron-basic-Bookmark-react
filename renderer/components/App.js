import React from 'react';
import PropTypes from 'prop-types';

import {ipcRenderer, clipboard} from 'electron';

import Button from './Button';
import Item from './Item';

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            type: 'home',
            data: []
        }

        ipcRenderer.on('data', (event, data) => {
            this.setState({data});
        });

        document.addEventListener('paste', () => {
            ipcRenderer.send('paste', {
                type: this.state.type,
                url: clipboard.readText()
            });
        });
    }

    render() {
        const items = this.state.data.filter((item, index) => {
            item.index = index;
            return item.type === this.state.type;
        }).map(item => {
            return <Item url={item.url} title={item.title} index={item.index} key={item.index} />;
        });

        return (
            <div className="window">
                <header className="toolbar toolbar-header">
                    <div className="toolbar-actions">
                        <h1 className="title">Mark's Bookmark</h1>
                        <div className="btn-group">
                            <Button active={this.state.type === 'home'} type="home" icon="icon-home" changeType={this.changeType.bind(this)} />
                            <Button active={this.state.type === 'github'} type="github" icon="icon-github" changeType={this.changeType.bind(this)} />
                        </div>
                    </div>
                </header>
                <div className="window-content">
                    <ul className="list-group">
                        {items}
                    </ul>
                </div>
            </div>
        );
    }

    changeType(type) {
        this.setState({type});
    }
}