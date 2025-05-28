import React, { useState, useEffect } from 'react'
import { Form, Input, Button, message } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import axios from 'axios'
import '../resources/auth.css'
import Spinner from '../components/Spinner'

const Login = () => {
  const host =
    process.env.NODE_ENV === 'production'
      ? 'https://cash-book.vercel.app'
      : 'http://localhost:5000'

  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = async (values) => {
    try {
      setLoading(true)
      const response = await axios.post(`${host}/api/users/login`, values)
      localStorage.setItem('Cashbook-User', JSON.stringify(response.data))
      message.success('Login successful!')
      navigate('/dashboard')
    } catch (error) {
      message.error('Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (localStorage.getItem('Cashbook-User')) {
      navigate('/')
    }
  }, [navigate])

  return (
    <div className='auth-container'>
      {loading && <Spinner />}
      <div className='auth-card'>
        <div className='auth-header'>
          <img
            src='/assets/moneymate.png'
            alt='MoneyMate Logo'
            className='auth-logo'
          />
          <h1 className='auth-title'>Welcome back!</h1>
          <p className='auth-subtitle'>Please sign in to continue</p>
        </div>

        <Form
          name='login'
          className='auth-form'
          onFinish={onFinish}
          layout='vertical'
        >
          <Form.Item
            name='email'
            rules={[{ required: true, message: 'Please enter your email' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder='Email'
              size='large'
            />
          </Form.Item>

          <Form.Item
            name='password'
            rules={[
              { required: true, message: 'Please enter your password' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder='Password'
              size='large'
            />
          </Form.Item>

          <Button
            type='primary'
            htmlType='submit'
            block
            size='large'
            loading={loading}
          >
            Sign In
          </Button>
        </Form>

        <div className='auth-links'>
          <Link to='/forgot-password'>Forgot password?</Link>
          <Link to='/register'>Create account</Link>
        </div>
      </div>
    </div>
  )
}

export default Login
