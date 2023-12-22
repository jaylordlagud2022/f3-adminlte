<?php


class HomeController extends Controller {

    public function index() {
        $this->f3->set('errors', array());
        echo Template::instance()->render('index.html');
    }

}
