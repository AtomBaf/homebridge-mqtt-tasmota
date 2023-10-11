var MqttTasmotaBaseAccessory = require('./accessory')


// TODO refactor with temperature accessory
class MqttTasmotaSensorAccessory extends MqttTasmotaBaseAccessory {

    constructor(log, config, api) {

        super(log, config, api)

        // TASMOTA vars
        this.mqttTopic = config['topic']
        this.mqttTeleTopic = config['teleTopic'] || this.buildTopic('tele', 'SENSOR')
        this.mqttCommandTopic = config['commandTopic'] || this.buildTopic('cmnd', 'TelePeriod')

        // STATE vars
        this.currentHumidity = 0; // last known Humidity
        this.currentTemperature = -99.0; // last known temperature

        this.mqttClient.subscribe(this.mqttTeleTopic)

        // register the service and provide the callback functions
        this.humService = new this.api.hap.Service.HumiditySensor(this.name)
        this.humService
            .getCharacteristic(this.api.hap.Characteristic.CurrentRelativeHumidity)
            .on('get', this.onGetCurrentRelativeHumidity.bind(this))

        this.tempService = new this.api.hap.Service.TemperatureSensor(this.name)
        this.tempService
            .getCharacteristic(this.api.hap.Characteristic.CurrentTemperature)
            .on('get', this.onGetCurrentTemperature.bind(this))

        // send an empty MQTT command to get the initial state
        this.mqttClient.publish(this.mqttCommandTopic, '1', this.mqttOptions)
    }

    // MQTT handler
    onMqttMessage(topic, message) {

        if (super.onMqttMessage(topic, message)) {
             return true
        }

        // message looks like this
        // {"Time":"2020-10-31T15:52:28","DHT11":{"Temperature":18.5,"Humidity":34.0,"DewPoint":2.3},"TempUnit":"C"}
        message = JSON.parse(message.toString('utf-8'))

        const sensors = ['DS18B20','DHT','DHT22','AM2301','DHT11','HTU21','BMP280','BME280','BMP180']

        for (let sensor of sensors) {

            if (message.hasOwnProperty(sensor)) {
                // update CurrentState
                this.currentHumidity = parseFloat(message[sensor]['Humidity'])
                this.humService
                    .getCharacteristic(this.api.hap.Characteristic.CurrentRelativeHumidity)
                    .updateValue(this.currentHumidity)
                this.log('Updated CurrentHumidity: %f', this.currentHumidity)

                this.currentTemperature = parseFloat(message[sensor]['Temperature'])
                this.tempService
                    .getCharacteristic(this.api.hap.Characteristic.CurrentTemperature)
                    .updateValue(this.currentTemperature)
                this.log('Updated CurrentTemperature: %f', this.currentTemperature)

                break
            }
        }
    }

    // Homebridge handlers
    getServices() {
        var services = super.getServices()
        services.push(this.tempService)
        services.push(this.humService)
        return services
    }
    onGetCurrentRelativeHumidity(callback) {
        this.log('Requested CurrentHumidity: %f', this.currentHumidity)
        callback(this.currentStatusCode(), this.currentHumidity)
    }

    onGetCurrentTemperature(callback) {
        this.log('Requested CurrentTemperature: %f', this.currentTemperature)
        callback(this.currentStatusCode(), this.currentTemperature)
    }
}

module.exports = MqttTasmotaSensorAccessory
