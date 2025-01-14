import React, { MouseEvent } from 'react';
import { Grid, Typography, useScrollTrigger } from '@mui/material';
import {
  AssociatedOwner,
  SearchApiSearchRequest,
  SearchFacetsData,
  TermApiTermSearchRequest,
  TermSearchFacetsData,
} from 'generated-sources';
import { fetchAppInfo } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import { getVersion } from 'redux/selectors/appInfo.selectors';
import { useHistory, useLocation } from 'react-router-dom';
import AppTabs, { AppTabItem } from 'components/shared/AppTabs/AppTabs';
import DropdownIcon from 'components/shared/Icons/DropdownIcon';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import AppMenu from 'components/shared/AppMenu/AppMenu';
import AppMenuItem from 'components/shared/AppMenuItem/AppMenuItem';
import { clearActivityFilters } from 'redux/reducers/activity.slice';
import { useAppPaths } from 'lib/hooks/useAppPaths';
import * as S from './AppToolbarStyles';

interface AppToolbarProps {
  identity?: AssociatedOwner;
  fetchIdentity: () => Promise<AssociatedOwner | void>;
  createDataEntitiesSearch: (
    params: SearchApiSearchRequest
  ) => Promise<SearchFacetsData>;
  createTermSearch: (
    params: TermApiTermSearchRequest
  ) => Promise<TermSearchFacetsData>;
}

const AppToolbar: React.FC<AppToolbarProps> = ({
  identity,
  createDataEntitiesSearch,
  createTermSearch,
  fetchIdentity,
}) => {
  const location = useLocation();
  const history = useHistory();
  const menuId = 'primary-search-account-menu';
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const isMenuOpen = Boolean(anchorEl);
  const dispatch = useAppDispatch();
  const { searchPath, termSearchPath } = useAppPaths();
  const version = useAppSelector(getVersion);
  const handleProfileMenuOpen = (event: MouseEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    window.location.href = '/logout';
  };

  const [elevation, setElevation] = React.useState<number>(0);
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 10,
    target: window,
  });

  React.useEffect(() => setElevation(trigger ? 3 : 0), [trigger]);

  React.useEffect(() => {
    fetchIdentity();
    dispatch(fetchAppInfo());
  }, []);

  const [tabs] = React.useState<AppTabItem[]>([
    { name: 'Catalog', link: '/search' },
    { name: 'Management', link: '/management' },
    { name: 'Dictionary', link: '/termsearch' },
    { name: 'Alerts', link: '/alerts' },
    { name: 'Activity', link: '/activity' },
  ]);

  const [selectedTab, setSelectedTab] = React.useState<number | boolean>(
    false
  );

  React.useEffect(() => {
    const newTabIndex = tabs.findIndex(tab => {
      if (tab.link === '/activity' || tab.link === '/alerts') {
        return (
          location.pathname.includes(tab.link) &&
          !location.pathname.includes('dataentities')
        );
      }

      return tab.link && location.pathname.includes(tab.link);
    });

    if (newTabIndex >= 0) {
      setSelectedTab(newTabIndex);
    } else {
      setSelectedTab(false);
    }
  }, [setSelectedTab, location.pathname]);

  const [searchLoading, setSearchLoading] = React.useState<boolean>(false);
  const [termSearchLoading, setTermSearchLoading] =
    React.useState<boolean>(false);

  const handleTabClick = (idx: number) => {
    if (tabs[idx].name === 'Dictionary') {
      if (termSearchLoading) return;
      setTermSearchLoading(true);
      const termSearchQuery = {
        query: '',
        pageSize: 30,
        filters: {},
      };
      createTermSearch({ termSearchFormData: termSearchQuery }).then(
        termSearch => {
          const termSearchLink = termSearchPath(termSearch.searchId);
          history.replace(termSearchLink);
          setTermSearchLoading(false);
        }
      );
    } else if (tabs[idx].name === 'Catalog') {
      if (searchLoading) return;
      setSearchLoading(true);
      const searchQuery = {
        query: '',
        pageSize: 30,
        filters: {},
      };
      createDataEntitiesSearch({ searchFormData: searchQuery }).then(
        search => {
          const searchLink = searchPath(search.searchId);
          history.replace(searchLink);
          setSearchLoading(false);
        }
      );
    } else if (tabs[idx].name === 'Activity') {
      dispatch(clearActivityFilters());
    }
  };

  return (
    <S.Bar position="fixed" elevation={elevation}>
      <S.Container disableGutters>
        <S.ContentContainer container>
          <S.LogoContainer item xs={3}>
            <S.Title to="/">
              <S.Logo />
              <Typography variant="h4" noWrap>
                Platform
              </Typography>
            </S.Title>
          </S.LogoContainer>
          <S.ActionsContainer item xs={9}>
            <Grid item sx={{ pl: 1 }}>
              {tabs.length ? (
                <AppTabs
                  type="menu"
                  items={tabs}
                  selectedTab={selectedTab}
                  handleTabChange={handleTabClick}
                />
              ) : null}
            </Grid>
            <S.SectionDesktop item>
              <S.UserAvatar stroke="currentColor" />
              <S.UserName>{identity?.identity.username}</S.UserName>
              <AppIconButton
                icon={<DropdownIcon />}
                color="unfilled"
                edge="end"
                aria-label="account of current user"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
              />
            </S.SectionDesktop>
          </S.ActionsContainer>
        </S.ContentContainer>
      </S.Container>
      <AppMenu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        id={menuId}
        keepMounted
        transformOrigin={{ vertical: -42, horizontal: 'right' }}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        <AppMenuItem onClick={handleLogout}>Logout</AppMenuItem>
        {version && (
          <S.CaptionsWrapper>
            <AppMenuItem divider />
            <S.CaptionsTypographyWrapper>
              <Typography variant="caption">
                ODD Platform v.{version}
              </Typography>
            </S.CaptionsTypographyWrapper>
          </S.CaptionsWrapper>
        )}
      </AppMenu>
    </S.Bar>
  );
};

export default AppToolbar;
