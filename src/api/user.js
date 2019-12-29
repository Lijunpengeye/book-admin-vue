import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/api/users/admin/login',
    method: 'post',
    data
  })
}

export function userInfoList(data) {
  return request({
    url: '/api/users/usersinfo',
    method: 'get',
    params: data
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}
