import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { siteSettingsChanged } from '@/redux/slices/siteSettingsSlice';

function PinMenu() {
  const pinMenuSetting = useAppSelector((state) => state.siteSettings.pinMenu);
  const dispatch = useAppDispatch();

  const togglePinMenu = () => {
    if (pinMenuSetting) {
      document.body.classList.remove('show-menu');
      document.body.classList.add('hide-menu');
    }
    dispatch(siteSettingsChanged({ pinMenu: !pinMenuSetting }));
  };

  const buttonVariant = pinMenuSetting ? 'light' : 'secondary';

  return (
    <Button
      aria-label="Pin Menu"
      size="sm"
      variant={buttonVariant}
      onClick={togglePinMenu}
    >
      <FontAwesomeIcon icon={faThumbtack} />
    </Button>
  );
}

export default PinMenu;
