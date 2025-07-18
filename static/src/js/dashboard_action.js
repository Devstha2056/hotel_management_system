/** @odoo-module */
import { registry} from '@web/core/registry';
import { useService } from "@web/core/utils/hooks";
const { Component, onWillStart, onMounted} = owl
import { rpc } from "@web/core/network/rpc";
import { Domain } from "@web/core/domain";
import { _t } from "@web/core/l10n/translation";
import {serializeDate,serializeDateTime,} from "@web/core/l10n/dates";
const today = new Date();
const day = String(today.getDate()).padStart(2, '0');      // "12"
const month = String(today.getMonth() + 1).padStart(2, '0'); // "05"
const year = today.getFullYear();                           // 2025

const formattedDate = `${year}-${month}-${day}`;
export class CustomDashBoard extends Component {
    /**
     * Setup method to initialize required services and register event handlers.
     */
setup() {
    this.action = useService("action");
    this.orm = useService("orm");
    onWillStart(this.onWillStart);
    onMounted(this.onMounted);
}
async onWillStart() {
    await this.fetch_data();
}
async onMounted() {
// Render other components after fetching data
// this.render_project_task();
// this.render_top_employees_graph();
// this.render_filter();
}
async fetch_data() {
       var self = this;
       //RPC call for retrieving data for displaying on dashboard tiles
       var def1= await rpc('/web/dataset/call_kw/room.booking/get_details'
       ,{ model:'room.booking',
          method:'get_details',
           args: [{}],
           kwargs: {},
       }).then(function(result){
            document.getElementsByClassName("total_room").innerHTML=['total_room']
            self.total_room=result['total_room']
            self.available_room=result['available_room']
            self.staff=result['staff']
            self.check_in=result['check_in']
            self.reservation=result['reservation']
            self.check_out=result['check_out']
            self.total_vehicle=result['total_vehicle']
            self.available_vehicle=result['available_vehicle']
            self.total_event=result['total_event']
            self.today_events=result['today_events']
            self.pending_events=result['pending_events']
            self.food_items=result['food_items']
            self.food_order=result['food_order']

            if(result['currency_position']=='after'){
                self.total_revenue=result['currency_symbol']+" "+result['total_revenue']
                self.today_revenue=result['currency_symbol']+" "+result['today_revenue']
                self.month_revenue=result['currency_symbol']+" "+result['month_revenue']
                self.year_revenue=result['currency_symbol']+" "+result['year_revenue']
                self.pending_payment=result['currency_symbol']+" "+result['pending_payment']
            }
            else{
                self.total_revenue=+result['total_revenue']+" "+result['currency_symbol']
                self.today_revenue=result['today_revenue']+" "+result['currency_symbol']
                self.month_revenue=result['month_revenue']+" "+result['currency_symbol']
                self.year_revenue=result['year_revenue']+" "+result['currency_symbol']
                self.pending_payment=result['pending_payment']+" "+result['currency_symbol']
            }

       });

           return def1;
     }
     total_rooms(e){
        var self = this;
        e.stopPropagation();
        e.preventDefault();
        var options={on_reverse_breadcrum:this.on_reverse_breadcrum,};
                this.action.doAction({
                    name: _t("Rooms"),
                    type:'ir.actions.act_window',
                    res_model:'product.template',
                    view_mode:'list,form',
                    view_type:'form',
                    views:[[false,'list']],
                    domain: [['is_roomtype', '=', true]],
                    target:'current'
                },options)
    }
    check_ins(e){
        var self = this;
        e.stopPropagation();
        e.preventDefault();
        var options={on_reverse_breadcrum:this.on_reverse_breadcrum,};
        this.action.doAction({
            name: _t("Check-In"),
            type:'ir.actions.act_window',
            res_model:'room.booking.line',
            view_mode:'list,form',
            view_type:'form',
            views:[[false,'list']],
            domain: [['state', '=', 'check_in']],
            target:'current'
        },options)
    }
    //    Total Events
    view_total_events(e){
        var self = this;
        e.stopPropagation();
        e.preventDefault();
        var options={on_reverse_breadcrum:this.on_reverse_breadcrum,};
        this.action.doAction({
            name: _t("Total Events"),
            type:'ir.actions.act_window',
            res_model:'event.event',
            view_mode:'kanban,list,form',
            view_type:'form',
            views:[[false,'kanban'],[false,'list']],
            domain: [],
            target:'current'
        },options)
    }
//        //    Today's Events
    fetch_today_events(e){
        var self = this;
        e.stopPropagation();
        e.preventDefault();
        var options={on_reverse_breadcrum:this.on_reverse_breadcrum,};
        this.action.doAction({
            name: _t("Today's Events"),
            type:'ir.actions.act_window',
            res_model:'event.event',
            view_mode:'kanban,list,form',
            view_type:'form',
            views:[[false,'kanban'],[false,'list']],
            domain:  [['date_end', '=', formattedDate]],
            target:'current'
        },options)
    }
//        //    Pending Events
    fetch_pending_events(e){
        var self = this;
        e.stopPropagation();
        e.preventDefault();
        var options={on_reverse_breadcrum:this.on_reverse_breadcrum,};
        this.action.doAction({
            name: _t("Pending Events"),
            type:'ir.actions.act_window',
            res_model:'event.event',
            view_mode:'kanban,list,form',
            view_type:'form',
            views:[[false,'kanban'],[false,'list']],
            domain:  [['date_end', '>=', formattedDate]],
            target:'current'
        },options)
    }
//        //    Total staff
    fetch_total_staff(e){
        var self = this;
        e.stopPropagation();
        e.preventDefault();
        var options={on_reverse_breadcrum:this.on_reverse_breadcrum,};
        this.action.doAction({
            name: _t("Total Staffs"),
            type:'ir.actions.act_window',
            res_model:'res.users',
            view_mode:'list,form',
            view_type:'form',
            views:[[false,'list']],
            domain: [['groups_id.name', 'in',['Admin',
                       'Cleaning Team User',
                       'Cleaning Team Head',
                       'Receptionist',
                       'Maintenance Team User',
                       'Maintenance Team Leader'
                   ]]],
            target:'current'
        },options)
    }
    //    check-out
    check_outs(e){
        var self = this;
        var options={on_reverse_breadcrum:this.on_reverse_breadcrum,};
        this.action.doAction({
            name: _t("Today's Check-Out"),
            type:'ir.actions.act_window',
            res_model:'room.booking.line',
            view_mode:'list,form',
            view_type:'list,form',
            views:[[false,'list']],
            domain: [['state', '=', 'check_out'],['checkout_date', '>=', formattedDate]],
            target:'current'
        },options)
    }
//    Available rooms
    available_rooms(e){
        var self = this;
        e.stopPropagation();
        e.preventDefault();
        var options={on_reverse_breadcrum:this.on_reverse_breadcrum,};
        this.action.doAction({
            name: _t("Available Room"),
            type:'ir.actions.act_window',
            res_model:'product.template',
            view_mode:'list,form',
            view_type:'form',
            views:[[false,'list']],
            domain: [['status', '=', 'available'],['is_roomtype', '=', true],],
            target:'current'
        },options)
    }
//    Reservations
    reservations(e){
        var self = this;
        e.stopPropagation();
        e.preventDefault();
        var options={on_reverse_breadcrum:this.on_reverse_breadcrum,};
        this.action.doAction({
            name: _t("Total Reservations"),
            type:'ir.actions.act_window',
            res_model:'product.template',
            view_mode:'list,form',
            view_type:'form',
            views:[[false,'list']],
            domain: [['status', '=', 'reserved'],],
            target:'current'
        },options)
    }
//    Food Items
    fetch_food_item(e){
        var self = this;
        e.stopPropagation();
        e.preventDefault();
        var options={on_reverse_breadcrum:this.on_reverse_breadcrum,};
        this.action.doAction({
            name: _t("Food Items"),
            type:'ir.actions.act_window',
            res_model:'product.template',
            view_mode:'list,form',
            view_type:'form',
            views:[[false,'list']],
            domain: [['is_foodtype', '=', true]],
            target:'current'
        },options)
    }
//    food Orders
    async fetch_food_order(e){
        var self = this;
        const result = await this.orm.call('food.booking.line', 'search_food_orders',[{}],{});
        e.stopPropagation();
        e.preventDefault();
        var options={on_reverse_breadcrum:this.on_reverse_breadcrum,};
        this.action.doAction({
            name: _t("Food Orders"),
            type:'ir.actions.act_window',
            res_model:'food.booking.line',
            view_mode:'list,form',
            view_type:'form',
            views:[[false,'list']],
           domain: [['id','in', result]],
            target:'current'
        },options)
    }
//    total vehicle
    fetch_total_vehicle(e){
        var self = this;
        e.stopPropagation();
        e.preventDefault();
        var options={on_reverse_breadcrum:this.on_reverse_breadcrum,};
        this.action.doAction({name: _t("Total Vehicles"),
                    type:'ir.actions.act_window',
                    res_model:'fleet.vehicle.model',
                    view_mode:'list,form',
                    view_type:'form',
                    views:[[false,'list']],
                    target:'current'
                },options)
    }
//    Available Vehicle
    async fetch_available_vehicle(e){
    const result = await this.orm.call('fleet.booking.line', 'search_available_vehicle',[{}],{});
        var self = this;
        var options={on_reverse_breadcrum:this.on_reverse_breadcrum,};
        e.stopPropagation();
        e.preventDefault();
        this.action.doAction({
            name: _t("Available Vehicle"),
            type:'ir.actions.act_window',
            res_model:'fleet.vehicle.model',
            view_mode:'list,form',
            view_type:'form',
            views:[[false,'list']],
            domain: [['id','not in', result]],
            target:'current'
        },options)
    }
}
CustomDashBoard.template = "CustomDashBoard"
registry.category("actions").add("custom_dashboard_tags", CustomDashBoard)