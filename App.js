import React from 'react';
import {StyleSheet, Text} from 'react-native';
import {Container, Item, Form, Input, Button, Label} from 'native-base';
import * as firebaseApp from 'firebase';
import ToDoScreen from './todo_screen';
import {createAppContainer} from 'react-navigation';

import {createStackNavigator} from 'react-navigation-stack';

let Config = {
  apiKey: 'AIzaSyAQgzL0lGEeFv_Th0kCy_qJpA6iqCXa4i8',
  authDomain: 'digitalcube-d2b69.firebaseapp.com',
  databaseURL: 'https://digitalcube-d2b69.firebaseio.com',
  projectId: 'digitalcube-d2b69',
  storageBucket: 'digitalcube-d2b69.appspot.com',
  messagingSenderId: '678088808618',
};

class Login extends React.Component {
  constructor(props) {
    super(props);
    firebaseApp.initializeApp(Config);
    this.state = {
      email: '',
      password: '',
      accessToken: '',
    };
  }

  componentDidMount() {
    firebaseApp.auth().onAuthStateChanged(user => {
      if (user) {
        this.props.navigation.navigate('ToDo', {user: user});
      } else {
        // this.props.navigation.navigate('Login');
      }
    });
  }

  SignIn = async (email, password) => {
    try {
      firebaseApp
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(
          res => console.log('signInWithEmailAndPassword pass', res.user),
          //this.props.navigation.navigate('ToDo'),
        )
        .catch(error => alert(error));

      firebaseApp.auth().onAuthStateChanged(user => {
        if (user) {
          this.props.navigation.navigate('ToDo', {user: user});
        }
      });
    } catch (error) {
      alert(error.toString(error));
    }
  };

  SignUp = async (email, password) => {
    try {
      firebaseApp
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(
          res => console.log('createUserWithEmailAndPassword pass', res.user),
          //this.props.navigation.navigate('ToDo'),
        )
        .catch(error => alert(error));
    } catch (error) {
      alert(error.toString(error));
    }
    firebaseApp.auth().onAuthStateChanged(user => {
      if (user) {
        this.props.navigation.navigate('ToDo', {user: user});
      }
    });
  };
  render() {
    return (
      <Container style={styles.container}>
        <Form>
          <Item floatingLabel>
            <Label>Email</Label>
            <Input
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={email => this.setState({email})}
            />
          </Item>
          <Item floatingLabel>
            <Label>Password</Label>
            <Input
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={password => this.setState({password})}
            />
          </Item>
          <Button
            full
            rounded
            style={{marginTop: 20}}
            onPress={() => this.SignIn(this.state.email, this.state.password)}>
            <Text>SignIn</Text>
          </Button>
          <Button
            full
            rounded
            success
            style={{marginTop: 20}}
            onPress={() => this.SignUp(this.state.email, this.state.password)}>
            <Text>SignUp</Text>
          </Button>
        </Form>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 10,
  },
});

const RootStack = createStackNavigator(
  {
    Login: Login,
    ToDo: ToDoScreen,
  },
  {
    initialRouteName: 'Login',
  },
);

const AppContainer = createAppContainer(RootStack);

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}
