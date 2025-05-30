
from odoo import api, fields, models, tools


class FleetBookingLine(models.Model):
    """Model that handles the fleet booking"""
    _name = "fleet.booking.line"
    _description = "Hotel Fleet Line"
    _rec_name = 'fleet_id'

    @tools.ormcache()
    def _get_default_uom_id(self):
        """Method for getting the default uom id"""
        return self.env.ref('uom.product_uom_km')

    booking_id = fields.Many2one("room.booking", string="Booking",
                                 ondelete="cascade",
                                 help="Shows the room Booking")



    fleet_id = fields.Many2one('fleet.vehicle.model',
                               string="Vehicle",
                               help='Indicates the Vehicle')
    description = fields.Char(string='Description',
                              related='fleet_id.display_name',
                              help="Description of Vehicle")
    uom_qty = fields.Float(string="Total KM", default=1,
                           help="The quantity converted into the UoM used by "
                                "the product")
    uom_id = fields.Many2one('uom.uom', readonly=True,
                             string="Unit of Measure",
                             default=_get_default_uom_id, help="This will set "
                                                               "the unit of"
                                                               " measure used")
    price_unit = fields.Float(string='Rent/KM',
                              related='fleet_id.price_per_km',
                              digits='Product Price',
                              help="The rent/km of the selected fleet.")
    tax_ids = fields.Many2many('account.tax',
                               'hotel_fleet_order_line_taxes_rel',
                               'fleet_id',
                               'tax_id', string='Taxes',
                               help="Default taxes used when renting the fleet"
                                    "models.",
                               domain=[('type_tax_use', '=', 'sale')])
    currency_id = fields.Many2one(
        related='booking_id.pricelist_id.currency_id',
        string="Currency", help='The currency used')
    price_subtotal = fields.Float(string="Subtotal",
                                  compute='_compute_price_subtotal',
                                  help="Total price excluding tax",
                                  store=True)
    price_tax = fields.Float(string="Total Tax",
                             compute='_compute_price_subtotal',
                             help="Total tax amount",
                             store=True)
    price_total = fields.Float(string="Total",
                               compute='_compute_price_subtotal',
                               help="Total Price Including Tax",
                               store=True)
    state = fields.Selection(related='booking_id.state',
                             string="Order Status",
                             help=" Status of the Order",
                             copy=False)

    @api.depends('uom_qty', 'price_unit', 'tax_ids')
    def _compute_price_subtotal(self):
        """Compute the amounts of the room booking line."""
        for line in self:
            base_line = line._prepare_base_line_for_taxes_computation()
            self.env['account.tax']._add_tax_details_in_base_line(base_line, self.env.company)
            line.price_subtotal = base_line['tax_details']['raw_total_excluded_currency']
            print("total_excluded_currency", line.price_subtotal)
            line.price_total = base_line['tax_details']['raw_total_included_currency']
            print("total_included_currency", line.price_total)
            line.price_tax = line.price_total - line.price_subtotal
            if self.env.context.get('import_file',
                                    False) and not self.env.user. \
                    user_has_groups('account.group_account_manager'):
                line.tax_id.invalidate_recordset(
                    ['invoice_repartition_line_ids'])

    def _prepare_base_line_for_taxes_computation(self):
        """ Convert the current record to a dictionary in order to use the generic taxes computation method
        defined on account.tax.

        :return: A python dictionary.
        """
        self.ensure_one()
        return self.env['account.tax']._prepare_base_line_for_taxes_computation(
            self,
            **{
                'tax_ids': self.tax_ids,
                'quantity': self.uom_qty,
                'partner_id': self.booking_id.partner_id,
                'currency_id': self.currency_id,
            },
        )

    def search_available_vehicle(self):
        """Returns list of booked vehicles"""
        return (self.env['fleet.vehicle.model'].search(
            [('id', 'in', self.search([]).mapped('fleet_id').ids)]).ids)
