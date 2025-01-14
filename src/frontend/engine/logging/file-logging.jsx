import React from 'react'
import PropTypes from 'prop-types'
import OibForm from '../../components/oib-form/oib-form.jsx'
import { minValue, inRange } from '../../../service/validation.service'

const schema = { name: 'FileLogging' }
schema.form = {
  level: {
    type: 'OibSelect',
    options: ['trace', 'debug', 'info', 'warning', 'error', 'none'],
    md: 3,
    defaultValue: 'info',
    help: <div>The level for the File log</div>,
  },
  maxSize: {
    type: 'OibInteger',
    newRow: false,
    label: 'File max size',
    md: 2,
    valid: minValue(10000),
    defaultValue: 100000,
    help: <div>Maximum size of the log files (Bytes)</div>,
  },
  numberOfFiles: {
    type: 'OibInteger',
    newRow: false,
    label: 'Number of files',
    md: 2,
    valid: inRange(1, 10),
    defaultValue: 5,
    help: <div>The number of log files (rotating)</div>,
  },
  tailable: {
    type: 'OibCheckbox',
    newRow: false,
    md: 3,
    label: 'Tailable',
    defaultValue: true,
  },
}

const FileLogging = ({ logParameters, onChange }) => (
  <div>
    <h6>File</h6>
    <OibForm onChange={onChange} schema={schema} name="engine.logParameters.fileLog" values={logParameters} />
  </div>
)

FileLogging.propTypes = {
  onChange: PropTypes.func.isRequired,
  logParameters: PropTypes.object.isRequired,
}
export default FileLogging
