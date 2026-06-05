import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button, ErrorText } from '../ui';

describe('Button', () => {
  it('renders its title and fires onPress', () => {
    const onPress = jest.fn();
    render(<Button title="Tap me" onPress={onPress} testID="btn" />);
    expect(screen.getByText('Tap me')).toBeTruthy();
    fireEvent.press(screen.getByTestId('btn'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress while loading', () => {
    const onPress = jest.fn();
    render(<Button title="Saving" onPress={onPress} loading testID="btn" />);
    fireEvent.press(screen.getByTestId('btn'));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('ErrorText', () => {
  it('renders nothing when there is no message', () => {
    render(<ErrorText message={null} />);
    expect(screen.queryByText(/./)).toBeNull();
  });

  it('renders the message when present', () => {
    render(<ErrorText message="Something broke" />);
    expect(screen.getByText('Something broke')).toBeTruthy();
  });
});
