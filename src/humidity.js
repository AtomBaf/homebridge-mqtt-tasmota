var MqttTasmotaBaseAccessory = require('./accessory')


// TODO refactor with temperature accessory
class MqttTasmotaHumidityAccessory extends MqttTasmotaBaseAccessory {

    constructor(log, config, api) {

        super(log, config, api)

        // TASMOTA vars
        this.mqttTopic = config['topic']
        this.mqttTeleTopic = config['teleTopic'] || 'tele/' + this.mqttTopic + '/SENSOR'
        this.mqttCommandTopic = config['commandTopic'] || 'cmnd/' + this.mqttTopic + '/TelePeriod'

        // STATE vars
        this.currentHumidity = -99; // last known Humidity

        this.mqttClient.subscribe(this.mqttTeleTopic)

        // register the service and provide the callback functions
        this.service = new this.api.hap.Service.HumiditySensor(this.name)
        this.service
            .getCharacteristic(this.api.hap.Characteristic.CurrentRelativeHumidity)
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
                this.currentHumidity = parseFloat(message[sensor]['Humidity'])
                this.service
                    .getCharacteristic(this.api.hap.Characteristic.CurrentRelativeHumidity)
                    .updateValue(this.currentHumidity)
                this.log('Updated CurrentHumidity: %f', this.currentHumidity)
            }
        }
    }

    // Homebridge handlers
    onGetOn(callback) {
        this.log('Requested CurrentHumidity: %f', this.currentHumidity)
        callback(null, this.currentHumidity)
    }
}

module.exports = MqttTasmotaHumidityAccessory
