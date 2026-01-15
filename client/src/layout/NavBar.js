import React, { useEffect } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import Badge from 'react-bootstrap/Badge';
import Dropdown from 'react-bootstrap/Dropdown';

import { logout } from '../actions/userActions';
// import {
//   listNotifications,
//   markNotificationRead,
// } from '../actions/notificationActions';
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../actions/notificationActions';

export const NavBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // USER
  const { userInfo } = useSelector((state) => state.userLogin);

  // CART
  const { cartItems } = useSelector((state) => state.cart);

  // NOTIFICATIONS
  const notificationList = useSelector((state) => state.notificationList);
  const { notifications = [] } = notificationList;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (userInfo) {
      dispatch(listNotifications());
    }
  }, [dispatch, userInfo]);

  const logoutHandler = () => {
    dispatch(logout());
  };

  const handleNotificationClick = (notification) => {
    dispatch(markNotificationRead(notification._id));
    navigate(notification.link);
  };

  return (
    <Navbar expand="lg" variant="dark" bg="dark" fixed="top" className="mb-5">
      <div className="container">
        <LinkContainer to="/">
          <Navbar.Brand>The Shop</Navbar.Brand>
        </LinkContainer>

        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="ms-auto align-items-center">

            {/* NOTIFICATION */}
            {userInfo && (
              <Dropdown align="end" className="me-3">
                <Dropdown.Toggle
                  variant="dark"
                  id="dropdown-notification"
                  className="position-relative"
                >
                  <i className="fas fa-bell"></i> Notification

                  {unreadCount > 0 && (
                    <Badge
                      bg="danger"
                      pill
                      className="position-absolute top-0 start-100 translate-middle"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Dropdown.Toggle>

                {/* <Dropdown.Menu
                  style={{
                    width: '320px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                  }}
                >

                  {notifications.length === 0 && (
                    <Dropdown.Item className="text-center text-muted">
                      Không có thông báo
                    </Dropdown.Item>
                  )}

                  {notifications.map((n) => (
                    <Dropdown.Item
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      style={{
                        backgroundColor: n.isRead ? '#fff' : '#e7f1ff',
                        fontWeight: n.isRead ? 'normal' : 'bold',
                        whiteSpace: 'normal',
                      }}
                    >
                      <div>{n.title}</div>
                      <small className="text-muted">{n.message}</small>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu> */}
                <Dropdown.Menu
                  style={{
                    width: '320px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                  }}
                >
                  {/* ✅ MARK ALL AS READ */}
                  {unreadCount > 0 && (
                    <>
                      <Dropdown.Item
                        className="text-center text-primary fw-bold"
                        onClick={() => dispatch(markAllNotificationsRead())}
                      >
                        <i className="fas fa-check-double me-2"></i>
                        Mark all as read
                      </Dropdown.Item>
                      <Dropdown.Divider />
                    </>
                  )}

                  {/* EMPTY */}
                  {notifications.length === 0 && (
                    <Dropdown.Item className="text-center text-muted">
                      Không có thông báo
                    </Dropdown.Item>
                  )}

                  {/* LIST */}
                  {notifications.map((n) => (
                    <Dropdown.Item
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      style={{
                        backgroundColor: n.isRead ? '#fff' : '#e7f1ff',
                        fontWeight: n.isRead ? 'normal' : 'bold',
                        whiteSpace: 'normal',
                      }}
                    >
                      <div>{n.title}</div>
                      <small className="text-muted">{n.message}</small>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>

              </Dropdown>
            )}


            {/* CHAT */}
            <LinkContainer to="/chat">
              <Nav.Link>
                <i className="fas fa-comment"></i> Chat
              </Nav.Link>
            </LinkContainer>

            <LinkContainer to="/chatbot">
              <Nav.Link>
                <i className="fas fa-robot"></i> Chatbot
              </Nav.Link>
            </LinkContainer>

            {/* CART */}
            <LinkContainer to="/cart">
              <Nav.Link>
                <i className="fas fa-shopping-cart"></i>{' '}
                Cart {userInfo && `(${cartItems.reduce((a, c) => a + c.qty, 0)})`}
              </Nav.Link>
            </LinkContainer>

            {/* DISCOUNTS */}
            <LinkContainer to="/discounts">
              <Nav.Link>
                <i className="fas fa-tag"></i> Discounts
              </Nav.Link>
            </LinkContainer>

            {/* SELLER */}
            {userInfo?.role === 'seller' && (
              <LinkContainer to="/seller/products">
                <Nav.Link>My Products</Nav.Link>
              </LinkContainer>
            )}

            {/* ORDERS */}
            {userInfo && (
              <NavDropdown title="Orders">
                <LinkContainer to="/orders">
                  <NavDropdown.Item>My Orders</NavDropdown.Item>
                </LinkContainer>

                {userInfo.role === 'seller' && (
                  <LinkContainer to="/seller/orders">
                    <NavDropdown.Item>My Sales</NavDropdown.Item>
                  </LinkContainer>
                )}
              </NavDropdown>
            )}

            {/* USER */}
            {userInfo ? (
              <>
                <LinkContainer to="/profile">
                  <Nav.Link>{userInfo.name}</Nav.Link>
                </LinkContainer>
                <Nav.Link onClick={logoutHandler}>Logout</Nav.Link>
              </>
            ) : (
              <LinkContainer to="/login">
                <Nav.Link>
                  <i className="fas fa-user"></i> Sign In
                </Nav.Link>
              </LinkContainer>
            )}

            {/* ADMIN */}
            {userInfo?.isAdmin && (
              <>
                <LinkContainer to="/admin/userlist">
                  <Nav.Link>Shoppers</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/admin/productlist">
                  <Nav.Link>All Products</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/admin/orderlist">
                  <Nav.Link>All Orders</Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
};
