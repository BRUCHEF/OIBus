import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col } from 'reactstrap'
import { OIbText, OIbInteger, OIbSelect, OIbScanMode } from '../../client/components/OIbForm'

const OPCUAForm = ({ dataSource, onChange }) => (
  <>
    <Row>
      <Col md="4">
        <OIbText
          label="Host"
          onChange={onChange}
          value={dataSource.OPCUA.host}
          name="OPCUA.host"
          defaultValue=""
          help={<div>IP address of the OPC-UA server</div>}
        />
      </Col>
      <Col md="4">
        <OIbInteger
          label="OPCUA Port"
          onChange={onChange}
          value={dataSource.OPCUA.opcuaPort}
          name="OPCUA.opcuaPort"
          defaultValue="8888"
          help={<div>Port number of the OPCUA server</div>}
        />
      </Col>
      <Col md="4">
        <OIbInteger
          label="HTTPS Port"
          onChange={onChange}
          value={dataSource.OPCUA.httpsPort}
          name="OPCUA.httpsPort"
          defaultValue="8889"
          help={<div>HTTPS port number</div>}
        />
      </Col>
    </Row>
    <Row>
      <Col md="4">
        <OIbSelect
          label="OPCUA protocol"
          onChange={onChange}
          options={['mqtt', 'mqtts']}
          option={dataSource.OPCUA.mqttProtocol}
          defaultOption="mqtts"
          name="OPCUA.mqttProtocol"
          help={<div>Protocol OPCUA</div>}
        />
      </Col>
    </Row>
    <Row>
      <Col md="4">
        <OIbText
          label="End Point"
          onChange={onChange}
          value={dataSource.OPCUA.endPoint}
          name="OPCUA.endPoint"
          defaultValue=""
        />
      </Col>
    </Row>
    <Row>
      <Col md="4">
        <OIbSelect
          label="Time Origin"
          onChange={onChange}
          options={['server', 'oibus']}
          option={dataSource.OPCUA.timeOrigin}
          defaultOption="server"
          name="OPCUA.timeOrigin"
          help={<div>Origin of timestamps</div>}
        />
      </Col>
    </Row>
  </>
)

OPCUAForm.propTypes = { dataSource: PropTypes.object.isRequired, onChange: PropTypes.func.isRequired }

/**
 * The following keys will be used by the **ConfigurePoints** form to display the headers
 * and the rows that are specific for each protocol.
 * Note: alternatively, we can send a "fake" point array to get the headers
 * using: ProtocolForm.renderPoints([{}],()=>null)[0].map(el => el.value.props.title)
 * @returns {array} Headers for each column
 */
OPCUAForm.renderHeaders = () => ['Point Id', 'ScanMode', 'NS', 'S']
OPCUAForm.renderPoints = (points, onChange) => {
  const rows = points.map((point, index) => [
    {
      name: `points.${index}.pointId`,
      value: (
        <OIbText
          title="Point Id"
          name={`points.${index}.pointId`}
          value={point.pointId}
          onChange={onChange}
          defaultValue=""
        />
      ),
    },
    {
      name: `points.${index}.scanMode`,
      value: (
        <OIbScanMode
          name={`points.${index}.scanMode`}
          scanMode={point.scanMode}
          onChange={onChange}
        />
      ),
    },
    {
      name: `points.${index}.ns`,
      value: (
        <OIbText
          title="NS"
          name={`points.${index}.ns`}
          value={point.ns}
          onChange={onChange}
          defaultValue=""
        />
      ),
    },
    {
      name: `points.${index}.s`,
      value: (
        <OIbText
          title="S"
          name={`points.${index}.s`}
          value={point.s}
          onChange={onChange}
          defaultValue="Counter1"
        />
      ),
    },
  ])
  return rows
}

export default OPCUAForm
