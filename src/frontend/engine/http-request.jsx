import React from 'react'
import PropTypes from 'prop-types'
import { Col, Row } from 'reactstrap'
import { OibTitle, OibInteger, OibSelect } from '../components/oib-form'
import validation from './engine.validation'

const HttpRequest = ({
  onChange,
  httpRequest,
}) => (
  <>
    <OibTitle label="Http request parameters">
      <p>
        Centralized configuration for applications communication via HTTP requests.
        <li>
          Stack: OIBus can use several IP stacks to communicate with the host. In certain network configuration
          (firewall settings for example), it might be useful to try a different stack. We generally advise to
          leave &apos;fetch&apos; as it is the native nodej stack but we also use axios as it reports good
          messages to diagnostic network errors.
        </li>
      </p>
    </OibTitle>
    <Row>
      <Col md={2}>
        <OibSelect
          label="Stack"
          name="engine.httpRequest.stack"
          options={['axios', 'fetch']}
          value={httpRequest.stack}
          defaultValue="fetch"
          help={<div>The stack used to send the request</div>}
          onChange={onChange}
        />
      </Col>
      <Col md={2}>
        <OibInteger
          label="Timeout"
          name="engine.httpRequest.timeout"
          value={httpRequest.timeout}
          defaultValue={30}
          valid={validation.engine.httpRequest.timeout}
          help={<div>How long to wait for the request to finish (in seconds)</div>}
          onChange={onChange}
        />
      </Col>
    </Row>
  </>
)
HttpRequest.propTypes = {
  onChange: PropTypes.func.isRequired,
  httpRequest: PropTypes.object.isRequired,
}
export default HttpRequest
