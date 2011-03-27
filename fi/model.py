import os

import elixir

import fi

# Make connection to sqlite
elixir.metadata.bind = "sqlite:///%s" % fi.DATABASE_PATH

# Global options
elixir.options_defaults['shortnames'] = True
if os.exists(fi.DATABASE_PATH):
    elixir.options_defaults['autoload'] = True

# Model
Model = elixir.Entity
Field = elixir.Field

# Datatypes for models
Integer = elixir.Integer
String = elixir.String
DateTime = elixir.DateTime

def commit():
    elixir.setup_all()
    elixir.create_all()
    elixir.session.commit()