var MqttTasmotaBaseAccessory = require('./accessory')


class MqttTasmotaTemperatureAccessory extends MqttTasmotaBaseAccessory {

    constructor(log, config, api) {

        super(log, config, api)

        // TASMOTA vars
        this.mqttTopic = config['topic']
        this.mqttTeleTopic = config['teleTopic'] || 'tele/' + this.mqttTopic + '/SENSOR'
        this.mqttCommandTopic = config['commandTopic'] || 'cmnd/' + this.mqttTopic + '/TelePeriod'

        // STATE vars
        this.currentTemperature = -99.0; // last known temperature

        this.mqttClient.subscribe(this.mqttTeleTopic)

        // register the service and provide the callback functions
        this.service = new this.api.hap.Service.TemperatureSensor(this.name)
        this.service
            .getCharacteristic(this.api.hap.Characteristic.CurrentTemperature)
            .on('get', this.onGetOn.bind(this))

        // send an empty MQTT command to get the initial state
        this.mqttClient.publish(this.mqttCommandTopic, '1', this.mqttOptions)
    }

    // MQTT handler
    onMqttMessage(topic, message) {

        super.onMqttMessage(topic, message)

        // message looks like this
        // {"Time":"2020-10-31T15:52:28","DHT11":{"Temperature":18.5,"Humidity":34.0,"DewPoint":2.3},"TempUnit":"C"}
        message = JSON.parse(message.toString('utf-8'))

        const sensors = ['DS18B20','DHT','DHT22','AM2301','DHT11','HTU21','BMP280','BME280','BMP180']

        for (let sensor of sensors) {

            if (message.hasOwnProperty(sensor)) {
                // update CurrentState
                this.currentTemperature = parseFloat(message[sensor]['Temperature'])
                this.service
                    .getCharacteristic(this.api.hap.Characteristic.CurrentTemperature)
                    .updateValue(this.currentTemperature)
                this.log('Updated CurrentTemperature: %f', this.currentTemperature)
            }
        }
    }

    // Homebridge handlers
    onGetOn(callback) {
        this.log('Requested CurrentTemperature: %f', this.currentTemperature)
        callback(null, this.currentTemperature)
    }
}

module.exports = MqttTasmotaTemperatureAccessory
