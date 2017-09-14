import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchImage, changeImage } from './redux';

const CHANGE_IMAGE_AFTER_SECONDS = 10;

@connect(
  state => ({
    image: state.image,
  }),
  dispatch => ({
    actions: { ...bindActionCreators({ fetchImage, changeImage }, dispatch) }
  }),
)

export default class Container extends Component {
  state = {
    countDown: CHANGE_IMAGE_AFTER_SECONDS,  // Seconds till next image is shown
    paused: undefined,                      // Whether changing images is paused or not
  };

  // Fetch image once component mounted
  componentWillMount() {
    this.props.actions.fetchImage();
  }

  // Start changing images with timer on first initial load
  componentWillReceiveProps(nextProps) {
    if (nextProps.image && this.state.paused === undefined) {
      this.resume();
    }
  }

  // Decrease timer by one second
  decreaseTimer = () => {
    let secondsLeft = this.state.countDown - 1;
    if (secondsLeft < 0) {
      // reset the countdown
      secondsLeft = CHANGE_IMAGE_AFTER_SECONDS;
      this.changeImage();
    }
    this.setState({
      countDown: secondsLeft,
    });
  };

  // Pause the countdown
  pause = () => {
    this.setState({
      paused: true,
    }, () => clearInterval(this._timer));
  };

  // Resume or start the countdown
  resume = () => {
    this.setState({
      paused: false,
    }, () => {
      // Call this.decreaseTimer every second
      this._timer = setInterval(this.decreaseTimer, 1000);
    });
  };

  // Toggle between pause/resume
  toggle = () => {
    this.state.paused ? this.resume() : this.pause();
  };

  // Change image
  changeImage = () => {
    this.props.actions.changeImage();
  };

  render() {
    const { image } = this.props;
    if (!image) {
      return <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>;
    }
    return (
      <View style={styles.container}>
        <Image
          style={{ flex: 1 }}
          resizeMode='contain'
          source={{ uri: image.url }}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={this.toggle}>
            <Text style={styles.text}>
              {this.state.paused ? "RESUME" : `PAUSE (${this.state.countDown})`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Avenir',
    textAlign: 'center',
    fontSize: 16,
  },
  buttonContainer: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    paddingHorizontal: 30,
    paddingVertical: 30
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, .10)',
    borderColor: 'rgba(255, 255, 255, .75)',
    borderWidth: 2,
    borderRadius: 50,
    paddingHorizontal: 40,
    paddingVertical: 10,
  },
});
