import React, { Component } from 'react';
import Select, { createFilter } from 'react-select';
import { FixedSizeList as List } from 'react-window';

import './CharacterSelect.css';

const height = 35;

class MenuList extends Component {
  render() {
    const { options, children, maxHeight, getValue } = this.props;
    const [value] = getValue();
    const initialOffset = options.indexOf(value) * height;

    return (
      <List
        height={maxHeight}
        itemCount={children.length}
        itemSize={height}
        initialScrollOffset={initialOffset}
      >
        {({ index, style }) => <div style={style}>{children[index]}</div>}
      </List>
    );
  }
}

const CharacterSelect = (props) => (
  <Select
    {...props}
    components={{ MenuList }}
    id="characters"
    name="characters"
    defaultValue={[]}
    isMulti
    className="basic-multi-select"
    classNamePrefix="select"
    filterOption={createFilter({ ignoreAccents: false })}
  />
);

export default CharacterSelect;
