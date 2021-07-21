import React, { Component } from 'react'

import Navigation from './components/navigation/Navigation'
import SignIn from './components/signin/SignIn'
import Register from './components/register/Register'

import Logo from './components/logo/Logo'
import ImageLinkForm from './components/imagelinkform/ImageLinkForm'
import Rank from './components/rank/Rank'
import Particles from 'react-particles-js'
import FaceRecognition from './components/facerecognition/facerecognition'
import 'tachyons'
import './App.css';


const particlesParam = {
  polygon: {
    enable: true,
    type: 'inside',
    move: {
      radius: 10
    }
  }
}

const initialState = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: "",
        email: '',
        entries: 0,
        joined: ""
      }
    }
class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user:  {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    })
 }


  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = image.width;
    const height = image.height;
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }

  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value})
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input})
    fetch('http://localhost:3000/imageurl', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        input: this.state.input
      })
    })
    .then(res => res.json())
    .then(res => {
      if(res.outputs){
        fetch('http://localhost:3000/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        }).then(response => response.json())
        .then(count => {
          console.log(count)
          this.setState(Object.assign(this.state.user, {entries: count}))
        })
        .catch(console.log)
        this.displayFaceBox(this.calculateFaceLocation(res));
      }
    })
    .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if(route === 'signin'){
      this.setState(initialState);
    } else if (route === 'home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route: route})
  }

  render() {
    const {isSignedIn, imageUrl, route, box} = this.state;
    return (
      <div className="App">
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn}/>
        { route === 'home'? 
          <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries} />
              <ImageLinkForm onInputChange={this.onInputChange} 
                              onButtonSubmit={this.onButtonSubmit} />
              <FaceRecognition box={box} imageUrl={imageUrl}/>
           </div>
          : (
              route === 'signin'?
                <SignIn onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
                : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
            )
           
        }
      
       
      <Particles className="particles" 
          params={particlesParam} />
       
      </div>
    );
  }
}

export default App;
