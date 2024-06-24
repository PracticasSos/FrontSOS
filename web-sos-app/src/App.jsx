import UserRegistration from './components/UserRegistration';
import UserLogin from './components/UserLogin';

function App() {
  return (
    <div>
      <h1>Registro de Usuario</h1>
      <UserRegistration />
      
      <h1>Login de Usuario</h1>
      <UserLogin />
    </div>
  );
}

export default App;

/*import Registration from './components/UserRegistration';

const App = () => {
    return (
        <div>
            <Registration />
        </div>
    );
};

export default App;*/

