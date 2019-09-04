import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col } from 'reactstrap'
import { OIbText, OIbInteger, OIbSelect, OIbPassword, OIbTitle, OIbScanMode } from '../../client/components/OIbForm'
import validation from '../../client/helpers/validation'

const MQTTForm = ({ dataSource, onChange }) => (
  <>
    <OIbTitle title="MQTT settings">
      <ul>
        <li>
          <b>Protocol:</b>
          Network protocol used by MQTT client to connect with MQTT broker. OIBus supports MQTT, and
          MQTTS.
        </li>
        <li>
          <b>Host and Port:</b>
          MQTT host to connect. Make sure you specify right host and port number depending on MQTT
          connection protocol you selected. MQTT client may not get connected if you mention wrong port number or
          interchange port numbers.
        </li>
        <li>
          <b>Username:</b>
          Username required by broker, if any. MQTT allows to send username for authenticating and
          authorization of client.
        </li>
        <li>
          <b>Password:</b>
          Password required by broker, if any. MQTT allows to send password for authenticating and
          authorization of client.
        </li>
      </ul>
    </OIbTitle>
    <Row>
      <Col md="4">
        <OIbText
          label="Server"
          onChange={onChange}
          value={dataSource.MQTT.server}
          valid={validation.south.MQTT.server}
          name="MQTT.server"
          defaultValue=""
          help={<div>MQTT server address</div>}
        />
      </Col>
      <Col md="4">
        <OIbInteger
          label="Port"
          onChange={onChange}
          value={dataSource.MQTT.port}
          valid={validation.south.MQTT.port}
          name="MQTT.port"
          defaultValue={8883}
          help={<div>MQTT server port</div>}
        />
      </Col>
    </Row>
    <Row>
      <Col md="4">
        <OIbSelect
          label="MQTT protocol"
          onChange={onChange}
          options={['mqtt', 'mqtts']}
          option={dataSource.MQTT.mqttProtocol}
          defaultOption="mqtts"
          name="MQTT.mqttProtocol"
          help={<div>MQTT protocol</div>}
        />
      </Col>
    </Row>
    <Row>
      <Col md="4">
        <OIbText
          label="User"
          onChange={onChange}
          value={dataSource.MQTT.username}
          valid={validation.south.MQTT.username}
          help={<div>authorized user</div>}
          name="MQTT.username"
          defaultValue=""
        />
      </Col>
      <Col md="4">
        <OIbPassword
          label="Password"
          onChange={onChange}
          value={dataSource.MQTT.password}
          valid={validation.south.MQTT.password}
          name="MQTT.password"
          help={<div>password</div>}
          defaultValue=""
        />
      </Col>
    </Row>
  </>
)

MQTTForm.propTypes = { dataSource: PropTypes.object.isRequired, onChange: PropTypes.func.isRequired }

/**
 * The following keys will be used by the **ConfigurePoints** form to display the headers
 * and the rows that are specific for each protocol.
 * Note: alternatively, we can send a "fake" point array to get the headers
 * using: ProtocolForm.renderPoints([{}],()=>null)[0].map(el => el.value.props.title)
 * @returns {array} Headers for each column
 */
MQTTForm.renderHeaders = () => ['Point Id', 'ScanMode', 'Topic']
MQTTForm.renderPoints = (points, onChange) => {
  const rows = points.map((point, index) => [
    {
      name: `points.${index}.pointId`,
      value: (
        <OIbText
          title="Point Id"
          name={`points.${index}.pointId`}
          value={point.pointId}
          valid={validation.south.MQTT.points.pointId}
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
      name: `points.${index}.topic`,
      value: (
        <OIbText
          title="Topic"
          name={`points.${index}.topic`}
          value={point.topic}
          valid={validation.south.MQTT.points.topic}
          onChange={onChange}
          defaultValue=""
        />
      ),
    },
  ])
  return rows
}

export default MQTTForm
