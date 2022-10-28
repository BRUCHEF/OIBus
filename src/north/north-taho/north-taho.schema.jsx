import React from 'react'
import { inRange, isHost } from '../../service/validation.service'

const schema = { name: 'A3ITAHO' }
schema.form = {
  A3ITAHOSettings: {
    type: 'OibTitle',
    label: 'A3ITAHO settings',
    md: 12,
    children: (
      <p>
        A3ITAHO TODO.
      </p>
    ),
  },
  host: {
    type: 'OibText',
    defaultValue: '127.0.0.1',
    valid: isHost(),
    help: <div>IP address of the TAHO source</div>,
  },
  /** 
  ModuleADAM: {
    type: 'OIbText',
    defaultValue: 'ADAM00',
    valid: isModuleADAM(),
    help: <div>Module ADAM lié au TAHO</div>,
  },*/
  port: {
    type: 'OibInteger',
    newRow: false,
    valid: inRange(1, 65535),
    defaultValue: 9999,
    help: <div>LE Port number of the TAHO</div>,
  },
}
schema.category = 'IoT'

export default schema
